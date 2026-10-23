import {createHash} from 'node:crypto';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAITokenProvider, createZAIUserToken} from '../src/auth.js';
import type {ZAITokenAcquisitionContext, ZAITokenProviderOptions, ZAIUserTokenOptions} from '../src/auth.js';
import {ZAIClientError} from '../src/errors.js';

const identity = {appID: '应用🚀', userID: '用户😊', userName: '张三🌟'};
const signingSecret = '签名密钥🔑';
const epoch = 1_893_456_000;
const options = (value: unknown): ZAITokenProviderOptions => value as ZAITokenProviderOptions;
const expectedToken = (secret = signingSecret, expiresAt = epoch + 1000): string => {
  const payload = {
    hash: createHash('md5').update(secret + identity.appID + identity.userID + expiresAt, 'utf8').digest('hex'),
    app_id: identity.appID, user_id: identity.userID, expired_time: expiresAt, user_name: identity.userName,
  };
  return `ek-${Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')}`;
};
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {resolve = done;});
  return {promise, resolve};
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(epoch * 1000);});
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

describe('direct user-token signing', () => {
  it('matches an independent UTF-8 MD5 and Base64 oracle without any network access', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(createZAIUserToken({...identity, signingSecret, expiresAt: epoch + 123})).toBe(expectedToken(signingSecret, epoch + 123));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('defaults to a 1000-second lifetime and excludes an absent display name', () => {
    vi.setSystemTime(epoch * 1000 + 999);
    const token = createZAIUserToken({...identity, userName: undefined, signingSecret});
    const payload = JSON.parse(Buffer.from(token.slice(3), 'base64').toString('utf8')) as Record<string, unknown>;
    expect(payload.expired_time).toBe(epoch + 1000);
    expect(payload).not.toHaveProperty('user_name');
    expect(payload.hash).toBe(createHash('md5').update(signingSecret + identity.appID + identity.userID + (epoch + 1000), 'utf8').digest('hex'));
  });

  it.each([epoch, epoch - 1, 0, -1, 1.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid or expired Unix-second expiry %s', expiresAt => {
    expect(() => createZAIUserToken({...identity, signingSecret, expiresAt})).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it.each([
    null, undefined, {}, {...identity, signingSecret: ''}, {...identity, signingSecret: '  '},
    {...identity, signingSecret: 42}, {...identity, signingSecret, appID: ''},
    {...identity, signingSecret, userID: ''}, {...identity, signingSecret, userName: 42},
  ])('rejects malformed direct signing input without including secret material (%j)', value => {
    expect(() => createZAIUserToken(value as ZAIUserTokenOptions)).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});

describe('user-token providers with supplied signing secrets', () => {
  it('snapshots static credentials and reuses their configured secret after invalidation', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const credentials = {...identity, signingSecret};
    const provider = createZAITokenProvider({credentials, tokenType: 'user', expiresInSeconds: 100, refreshBeforeSeconds: 10});
    credentials.signingSecret = 'changed'; credentials.appID = 'changed'; credentials.userID = 'changed'; credentials.userName = 'changed';
    const original = await provider();
    expect(original).toBe(expectedToken(signingSecret, epoch + 100));
    vi.setSystemTime((epoch + 89) * 1000);
    expect(await provider()).toBe(original);
    vi.setSystemTime((epoch + 90) * 1000);
    expect(await provider()).toBe(expectedToken(signingSecret, epoch + 190));
    provider.invalidate({signingSecret: true});
    vi.setSystemTime((epoch + 91) * 1000);
    expect(await provider()).toBe(expectedToken(signingSecret, epoch + 191));
    expect(fetch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares dynamic secret retrieval, signs after retrieval and refreshes only on secret invalidation', async () => {
    const source = deferred<string>();
    const getSigningSecret = vi.fn<(context: ZAITokenAcquisitionContext) => string | Promise<string>>()
      .mockReturnValueOnce(source.promise).mockReturnValue('rotated-secret');
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret}, tokenType: 'user'});
    const first = provider();
    expect(provider()).toBe(first);
    await vi.advanceTimersByTimeAsync(0);
    expect(getSigningSecret).toHaveBeenCalledTimes(1);
    expect(getSigningSecret.mock.calls[0]![0].signal).toBeInstanceOf(AbortSignal);
    vi.setSystemTime((epoch + 20) * 1000);
    source.resolve(signingSecret);
    expect(await first).toBe(expectedToken(signingSecret, epoch + 1020));
    vi.setSystemTime((epoch + 960) * 1000);
    expect(await provider()).toBe(expectedToken(signingSecret, epoch + 1960));
    provider.invalidate();
    vi.setSystemTime((epoch + 961) * 1000);
    expect(await provider()).toBe(expectedToken(signingSecret, epoch + 1961));
    expect(getSigningSecret).toHaveBeenCalledTimes(1);
    provider.invalidate({signingSecret: true});
    expect(await provider()).toBe(expectedToken('rotated-secret', epoch + 1961));
    expect(getSigningSecret).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([undefined, 50])('times out a stalled dynamic source and ignores its late secret (%s)', async signingSecretTimeoutMs => {
    const old = deferred<string>();
    const getSigningSecret = vi.fn<(context: ZAITokenAcquisitionContext) => string | Promise<string>>()
      .mockReturnValueOnce(old.promise).mockReturnValue('fresh-secret');
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret}, tokenType: 'user', signingSecretTimeoutMs});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'authentication', cause: undefined});
    await vi.advanceTimersByTimeAsync((signingSecretTimeoutMs ?? 30_000) - 1);
    const {signal} = getSigningSecret.mock.calls[0]![0];
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejected;
    expect(signal.aborted).toBe(true);
    const currentTime = Math.floor(Date.now() / 1000);
    expect(await provider()).toBe(expectedToken('fresh-secret', currentTime + 1000));
    old.resolve('stale-secret');
    await vi.advanceTimersByTimeAsync(0);
    provider.invalidate();
    expect(await provider()).toBe(expectedToken('fresh-secret', currentTime + 1000));
    expect(getSigningSecret).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['invalidate', 'dispose'] as const)('aborts dynamic secret acquisition on %s and discards its result', async method => {
    const old = deferred<string>();
    const getSigningSecret = vi.fn<(context: ZAITokenAcquisitionContext) => string | Promise<string>>()
      .mockReturnValueOnce(old.promise).mockReturnValue('fresh-secret');
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret}, tokenType: 'user'});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider[method]();
    await rejected;
    expect(getSigningSecret.mock.calls[0]![0].signal.aborted).toBe(true);
    old.resolve('stale-secret');
    await vi.advanceTimersByTimeAsync(0);
    if (method === 'invalidate') {
      expect(await provider()).toBe(expectedToken('fresh-secret'));
      expect(getSigningSecret).toHaveBeenCalledTimes(2);
    } else {
      await expect(provider()).rejects.toMatchObject({code: 'aborted'});
      expect(getSigningSecret).toHaveBeenCalledTimes(1);
    }
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])('sanitizes dynamic source failure details and allows retry (asynchronous: %s)', async asynchronous => {
    const cause = Object.assign(new ZAIClientError('network', `Cannot load ${signingSecret}`, {cause: new Error(signingSecret), body: {signingSecret}}), {
      code: signingSecret, status: signingSecret,
    });
    const getSigningSecret = vi.fn<(context: ZAITokenAcquisitionContext) => string | Promise<string>>()
      .mockImplementationOnce(() => {if (asynchronous) return Promise.reject(cause); throw cause;})
      .mockReturnValue(signingSecret);
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret}, tokenType: 'user'});
    const error = await provider().catch((value: unknown) => value);
    expect(error).toBeInstanceOf(ZAIClientError);
    expect(error).toMatchObject({code: 'authentication', status: undefined, body: undefined, cause: undefined});
    expect(String(error)).not.toContain(signingSecret);
    expect(JSON.stringify(error)).not.toContain(signingSecret);
    expect(await provider()).toBe(expectedToken());
  });

  it.each([undefined, null, 42, '', '  ', {}])('rejects invalid dynamic secrets and permits a later retry (%j)', async value => {
    const getSigningSecret = vi.fn().mockReturnValueOnce(value).mockReturnValue(signingSecret);
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret}, tokenType: 'user'});
    await expect(provider()).rejects.toMatchObject({code: 'authentication', body: undefined, cause: undefined});
    expect(await provider()).toBe(expectedToken());
    expect(getSigningSecret).toHaveBeenCalledTimes(2);
  });
});

describe('signing-secret provider configuration', () => {
  it.each([
    {credentials: identity, tokenType: 'user'},
    {credentials: {...identity, signingSecret}},
    {credentials: {...identity, signingSecret}, tokenType: 'admin'},
    {credentials: {...identity, signingSecret: ''}, tokenType: 'user'},
    {credentials: {...identity, signingSecret: ' '}, tokenType: 'user'},
    {credentials: {...identity, signingSecret: 42}, tokenType: 'user'},
    {credentials: {...identity, getSigningSecret: signingSecret}, tokenType: 'user'},
    {credentials: {...identity, signingSecret, appKey: 'key'}, tokenType: 'user'},
    {credentials: {...identity, getSigningSecret: (): string => signingSecret, appKey: 'key'}, tokenType: 'user'},
    {credentials: {...identity, signingSecret, getSigningSecret: (): string => signingSecret}, tokenType: 'user'},
    ...[{signingSecret}, {getSigningSecret: (): string => signingSecret}].flatMap(source => [
      {baseUrl: 'https://zai.test/v1/zai'}, {fetch: vi.fn()}, {headers: {}}, {acquireTimeoutMs: 100},
    ].map(extra => ({credentials: {...identity, ...source}, tokenType: 'user', ...extra}))),
    ...[0, -1, 1.5, Number.NaN, Infinity, 2_147_483_648].map(signingSecretTimeoutMs => ({
      credentials: {...identity, getSigningSecret: (): string => signingSecret}, tokenType: 'user', signingSecretTimeoutMs,
    })),
  ])('rejects invalid or conflicting secret configuration (%j)', value => {
    expect(() => createZAITokenProvider(options(value))).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});
