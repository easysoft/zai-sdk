import {createHash} from 'node:crypto';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAIToken, createZAITokenProvider} from '../src/auth.js';
import type {ZAIToken, ZAITokenProviderOptions} from '../src/auth.js';
import {ZAIClientError} from '../src/errors.js';

const credentials = {appID: 'app-123', appKey: 'key-456', userID: 'user-789'};
const epoch = 1_893_456_000;
const decode = (token: string): {hash: string; app_id: string; user_id: string; expired_time: number} => JSON.parse(atob(token.slice(3)));
const options = (value: unknown): ZAITokenProviderOptions => value as ZAITokenProviderOptions;
const advance = (seconds: number): void => { vi.setSystemTime((epoch + seconds) * 1000); };

beforeEach(() => { vi.useFakeTimers(); advance(0); });
afterEach(() => { vi.useRealTimers(); });

describe('createZAIToken', () => {
  it('matches the fixed server protocol vector, field order and lowercase MD5', () => {
    expect(createZAIToken(credentials.appID, credentials.appKey, credentials.userID, epoch)).toBe(
      'ak-eyJoYXNoIjoiZjA3YTczZmJhNmFhYTRlOTVlNWQ4NjJiM2I5NTNlZTIiLCJhcHBfaWQiOiJhcHAtMTIzIiwidXNlcl9pZCI6InVzZXItNzg5IiwiZXhwaXJlZF90aW1lIjoxODkzNDU2MDAwfQ==',
    );
  });

  it.each([
    ['a', 'b', 'c', 0],
    ['app-é', '密钥 🔑', 'user-ñ', epoch],
    ['a"\\\n', 'key-456', 'user-789', epoch + 500],
  ])('matches an independent Node crypto oracle (%s)', (appID, appKey, userID, expiry) => {
    const expected = {
      hash: createHash('md5').update(`${appKey}${appID}${userID}${expiry}`, 'utf8').digest('hex'),
      app_id: appID, user_id: userID, expired_time: expiry,
    };
    const expectedToken = `ak-${Buffer.from(JSON.stringify(expected), 'latin1').toString('base64')}`;
    expect(createZAIToken(appID, appKey, userID, expiry)).toBe(expectedToken);
  });

  it('defaults to floor(now / 1000) + 1000 seconds', () => {
    vi.setSystemTime(epoch * 1000 + 999);
    expect(decode(createZAIToken('a', 'b', 'c')).expired_time).toBe(epoch + 1000);
  });

  it.each([Number.NaN, Infinity, -1, 1.2, Number.MAX_SAFE_INTEGER + 1])('rejects invalid expiry %s', expiry => {
    expect(() => createZAIToken('a', 'b', 'c', expiry)).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it.each([
    ['', 'b', 'c'], ['a', '', 'c'], ['a', 'b', ''], [1, 'b', 'c'],
  ])('rejects invalid credentials', (appID, appKey, userID) => {
    expect(() => createZAIToken(appID as string, appKey as string, userID as string)).toThrow(ZAIClientError);
  });

  it('preserves btoa semantics for non-Latin-1 payload values', () => {
    expect(() => createZAIToken('应用', 'secret', 'u')).toThrow(expect.objectContaining({code: 'invalid-input'}));
    expect(() => createZAIToken('a', 'secret', '用户')).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});

describe('createZAITokenProvider local credentials', () => {
  it('signs at first use, caches, and renews exactly at the default 60-second boundary', async () => {
    const getToken = createZAITokenProvider({credentials});
    advance(100);
    const first = await getToken();
    expect(decode(first).expired_time).toBe(epoch + 1100);
    advance(1039);
    expect(await getToken()).toBe(first);
    advance(1040);
    const second = await getToken();
    expect(second).not.toBe(first);
    expect(decode(second).expired_time).toBe(epoch + 2040);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renews after expiration and a long idle period, with a custom lifetime and zero refresh window', async () => {
    const getToken = createZAITokenProvider({credentials, expiresInSeconds: 10, refreshBeforeSeconds: 0});
    const first = await getToken();
    advance(9);
    expect(await getToken()).toBe(first);
    advance(10);
    expect(decode(await getToken()).expired_time).toBe(epoch + 20);
    advance(10_000);
    expect(decode(await getToken()).expired_time).toBe(epoch + 10_010);
  });

  it('isolates users and snapshots credential values at construction', async () => {
    const mutable = {...credentials};
    const first = createZAITokenProvider({credentials: mutable});
    const second = createZAITokenProvider({credentials: {...credentials, userID: 'other'}});
    mutable.userID = 'changed';
    const tokens = await Promise.all([first(), second()]);
    expect(decode(tokens[0]!).user_id).toBe(credentials.userID);
    expect(decode(tokens[1]!).user_id).toBe('other');
  });

  it('allows a lifetime shorter than the refresh window without repeated renewal in one call', async () => {
    const getToken = createZAITokenProvider({credentials, expiresInSeconds: 1});
    expect(decode(await getToken()).expired_time).toBe(epoch + 1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains invalid-input classification when local signing fails', async () => {
    const getToken = createZAITokenProvider({credentials: {...credentials, userID: '用户'}});
    await expect(getToken()).rejects.toMatchObject({code: 'invalid-input'});
  });
});

describe('createZAITokenProvider backend tokens', () => {
  it('supports synchronous sources and caches their value until renewal', async () => {
    const fetchToken = vi.fn(() => ({token: `token-${fetchToken.mock.calls.length}`, expiresAt: epoch + 100}));
    const getToken = createZAITokenProvider({fetchToken});
    expect(await getToken()).toBe('token-1');
    advance(39);
    expect(await getToken()).toBe('token-1');
    expect(fetchToken).toHaveBeenCalledTimes(1);
    advance(40);
    expect(await getToken()).toBe('token-2');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it('shares each asynchronous renewal between concurrent requests', async () => {
    let resolve!: (value: ZAIToken) => void;
    const fetchToken = vi.fn(() => new Promise<ZAIToken>(done => { resolve = done; }));
    const getToken = createZAITokenProvider({fetchToken});
    const first = getToken();
    const concurrent = Array.from({length: 20}, getToken);
    expect(concurrent.every(promise => promise === first)).toBe(true);
    await Promise.resolve();
    expect(fetchToken).toHaveBeenCalledTimes(1);
    resolve({token: 'one', expiresAt: epoch + 100});
    expect(await Promise.all(concurrent)).toEqual(Array(20).fill('one'));
    advance(40);
    const second = getToken();
    expect(getToken()).toBe(second);
    await Promise.resolve();
    resolve({token: 'two', expiresAt: epoch + 200});
    expect(await second).toBe('two');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])('shares failures and retries after a %s asynchronous failure', async asynchronous => {
    const cause = new Error('backend failure');
    const fetchToken = vi.fn<() => ZAIToken | Promise<ZAIToken>>()
      .mockImplementationOnce(() => { if (asynchronous) return Promise.reject(cause); throw cause; })
      .mockReturnValue({token: 'recovered', expiresAt: epoch + 1000});
    const getToken = createZAITokenProvider({fetchToken});
    const attempts = await Promise.allSettled([getToken(), getToken(), getToken()]);
    for (const attempt of attempts) {
      expect(attempt).toMatchObject({status: 'rejected', reason: {code: 'authentication', cause}});
    }
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(await getToken()).toBe('recovered');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it('reports failed renewal instead of silently using the cached token, then recovers', async () => {
    const fetchToken = vi.fn<() => ZAIToken | Promise<ZAIToken>>()
      .mockReturnValueOnce({token: 'old', expiresAt: epoch + 100})
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockReturnValueOnce({token: 'new', expiresAt: epoch + 500});
    const getToken = createZAITokenProvider({fetchToken});
    expect(await getToken()).toBe('old');
    advance(40);
    await expect(getToken()).rejects.toMatchObject({code: 'authentication'});
    expect(await getToken()).toBe('new');
  });

  it('uses a short-lived valid result for the current request without a refresh loop', async () => {
    const fetchToken = vi.fn(() => ({token: 'short', expiresAt: epoch + 1}));
    const getToken = createZAITokenProvider({fetchToken});
    expect(await getToken()).toBe('short');
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(await getToken()).toBe('short');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it('validates expiry when a slow fetch completes, not when it starts', async () => {
    let resolve!: (value: ZAIToken) => void;
    const getToken = createZAITokenProvider({fetchToken: () => new Promise<ZAIToken>(done => { resolve = done; })});
    const pending = getToken();
    await Promise.resolve();
    advance(10);
    resolve({token: 'expired-in-flight', expiresAt: epoch + 5});
    await expect(pending).rejects.toMatchObject({code: 'authentication'});
  });

  it.each([
    null, undefined, {}, {token: '', expiresAt: epoch + 100}, {token: '  ', expiresAt: epoch + 100},
    {token: 123, expiresAt: epoch + 100}, {token: 't'}, {token: 't', expiresAt: 'future'},
    {token: 't', expiresAt: epoch}, {token: 't', expiresAt: epoch - 1},
    {token: 't', expiresAt: Number.NaN}, {token: 't', expiresAt: Infinity},
    {token: 't', expiresAt: epoch + 1.5}, {token: 't', expiresAt: Number.MAX_SAFE_INTEGER + 1},
  ])('rejects invalid source results and permits a later retry (%j)', async value => {
    const fetchToken = vi.fn().mockReturnValueOnce(value).mockReturnValue({token: 'valid', expiresAt: epoch + 1000});
    const getToken = createZAITokenProvider({fetchToken});
    await expect(getToken()).rejects.toMatchObject({code: 'authentication'});
    expect(await getToken()).toBe('valid');
  });

  it('isolates provider caches even when the source function is shared', async () => {
    let count = 0;
    const fetchToken = vi.fn(() => ({token: `token-${++count}`, expiresAt: epoch + 1000}));
    const first = createZAITokenProvider({fetchToken});
    const second = createZAITokenProvider({fetchToken});
    expect(await Promise.all([first(), second()])).toEqual(['token-1', 'token-2']);
    expect(await Promise.all([first(), second()])).toEqual(['token-1', 'token-2']);
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it('snapshots source results to prevent external mutation of cached identity or expiry', async () => {
    const value = {token: 'original', expiresAt: epoch + 1000};
    const fetchToken = vi.fn(() => value);
    const getToken = createZAITokenProvider({fetchToken});
    await getToken();
    value.token = 'changed';
    value.expiresAt = 0;
    expect(await getToken()).toBe('original');
    expect(fetchToken).toHaveBeenCalledTimes(1);
  });
});

describe('token provider input validation', () => {
  it.each([
    null, undefined, 42, {},
    {credentials, fetchToken: () => ({token: 'x', expiresAt: epoch + 1000})},
    {credentials: null}, {credentials: 'invalid'}, {credentials: {...credentials, userID: ''}},
    {fetchToken: 'invalid'}, {fetchToken: () => ({}), expiresInSeconds: 100},
    ...[-1, 1.5, Infinity, Number.NaN, Number.MAX_SAFE_INTEGER + 1].map(refreshBeforeSeconds => ({credentials, refreshBeforeSeconds})),
    ...[0, -1, 1.5, Infinity, Number.NaN, Number.MAX_SAFE_INTEGER + 1].map(expiresInSeconds => ({credentials, expiresInSeconds})),
  ])('rejects invalid options (%j)', value => {
    expect(() => createZAITokenProvider(options(value))).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});
