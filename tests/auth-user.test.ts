import {createHash} from 'node:crypto';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAIToken, createZAITokenProvider} from '../src/auth.js';
import type {ZAITokenProviderOptions} from '../src/auth.js';

const credentials = {appID: '应用🚀', appKey: '密钥 🔑', userID: '用户😊', userName: '张三🌟'};
const secret = '用户签名🔒';
const baseUrl = 'https://zai.example.test/v1/zai';
const epoch = 1_893_456_000;
const response = (body: unknown = {app_id: credentials.appID, signing_secret: secret, token_prefix: 'ek-'}, status = 200): Response => Response.json(body, {status});
const decode = (token: string): Record<string, unknown> => JSON.parse(Buffer.from(token.slice(3), 'base64').toString('utf8'));
const advance = (seconds: number): void => {vi.setSystemTime((epoch + seconds) * 1000);};
const options = (value: unknown): ZAITokenProviderOptions => value as ZAITokenProviderOptions;

beforeEach(() => {vi.useFakeTimers(); advance(0);});
afterEach(() => {vi.useRealTimers();});

describe('application key to user-token signing', () => {
  it('matches fixed UTF-8 ak/ek vectors and retrieves the secret using ak', async () => {
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async request => {
      requests.push(request as Request);
      return response();
    });
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl: `${baseUrl}/`, fetch, headers: {'x-tenant': 'one', authorization: 'ignored'}});
    expect(fetch).not.toHaveBeenCalled();
    const token = await provider();
    expect(token).toBe('ek-eyJoYXNoIjoiZDViNTAwODU3MTA0YzQ3MzFjNjBiZDVlMzNhNGU2YWMiLCJhcHBfaWQiOiLlupTnlKjwn5qAIiwidXNlcl9pZCI6IueUqOaIt/CfmIoiLCJleHBpcmVkX3RpbWUiOjE4OTM0NTcwMDAsInVzZXJfbmFtZSI6IuW8oOS4ifCfjJ8ifQ==');
    const request = requests[0]!;
    expect(request.url).toBe(`${baseUrl}/signing_secret`);
    expect(request.method).toBe('GET');
    expect(request.headers.get('x-tenant')).toBe('one');
    expect(request.headers.get('authorization')).toBe('Bearer ak-eyJoYXNoIjoiNzI2NDgzZWI5OGEzNjMzZGFiN2JkN2U3NTUyNGVkOTgiLCJhcHBfaWQiOiLlupTnlKjwn5qAIiwidXNlcl9pZCI6IueUqOaIt/CfmIoiLCJleHBpcmVkX3RpbWUiOjE4OTM0NTcwMDAsInVzZXJfbmFtZSI6IuW8oOS4ifCfjJ8ifQ==');
    expect(request.headers.get('accept')).toBe('application/json');
    expect(decode(token).hash).toBe(createHash('md5').update(secret + credentials.appID + credentials.userID + (epoch + 1000), 'utf8').digest('hex'));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares first acquisition, calculates expiry after retrieval, and reuses the secret on renewal', async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi.fn<typeof globalThis.fetch>(() => new Promise<Response>(done => {resolve = done;}));
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const first = provider();
    const concurrent = Array.from({length: 20}, provider);
    expect(concurrent.every(value => value === first)).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    advance(20);
    resolve(response());
    const tokens = await Promise.all(concurrent);
    expect(new Set(tokens).size).toBe(1);
    expect(decode(tokens[0]!).expired_time).toBe(epoch + 1020);
    advance(959);
    expect(await provider()).toBe(tokens[0]);
    advance(960);
    const next = await provider();
    expect(next).not.toBe(tokens[0]);
    expect(decode(next).expired_time).toBe(epoch + 1960);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('snapshots credentials and headers and isolates secret caches between provider instances', async () => {
    const mutable = {...credentials};
    const headers = {'x-tenant': 'original'};
    const fetch = vi.fn<typeof globalThis.fetch>(async () => response());
    const first = createZAITokenProvider({credentials: mutable, tokenType: 'user', baseUrl, fetch, headers});
    const second = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    mutable.appID = 'changed'; mutable.appKey = 'changed'; mutable.userID = 'changed'; mutable.userName = 'changed';
    headers['x-tenant'] = 'changed';
    const [one, two] = await Promise.all([first(), second()]);
    expect(decode(one)).toMatchObject({app_id: credentials.appID, user_id: credentials.userID, user_name: credentials.userName});
    expect(one).toBe(two);
    expect((fetch.mock.calls[0]![0] as Request).headers.get('x-tenant')).toBe('original');
    const auth = (fetch.mock.calls[0]![0] as Request).headers.get('authorization')!;
    expect(auth).toBe(`Bearer ${createZAIToken(credentials.appID, credentials.appKey, credentials.userID, epoch + 1000, credentials.userName)}`);
    expect(fetch).toHaveBeenCalledTimes(2);
    await Promise.all([first(), second()]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    null, {}, [],
    {app_id: 'other', signing_secret: secret, token_prefix: 'ek-'},
    {app_id: credentials.appID, signing_secret: '', token_prefix: 'ek-'},
    {app_id: credentials.appID, signing_secret: ' ', token_prefix: 'ek-'},
    {app_id: credentials.appID, signing_secret: 1, token_prefix: 'ek-'},
    {app_id: credentials.appID, signing_secret: secret, token_prefix: 'ak-'},
    {app_id: credentials.appID, signing_secret: secret},
  ])('rejects mismatched secret responses without caching or leaking them (%j)', async body => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValueOnce(response(body)).mockResolvedValueOnce(response());
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const error = await provider().catch((value: unknown) => value);
    expect(error).toMatchObject({code: 'authentication', method: 'GET', path: '/signing_secret'});
    expect(error).toHaveProperty('body', undefined);
    expect(error).toHaveProperty('cause', undefined);
    expect(JSON.stringify(error)).not.toContain(secret);
    expect(await provider()).toMatch(/^ek-/);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 500])('sanitizes HTTP %s errors and retries only on a later caller request', async status => {
    const fetch = vi.fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(response({error: `Unable to use ${secret}`, signing_secret: secret}, status))
      .mockResolvedValueOnce(response());
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const errors = await Promise.allSettled([provider(), provider(), provider()]);
    for (const result of errors) {
      expect(result).toMatchObject({status: 'rejected', reason: {code: status === 500 ? 'http' : 'authentication', status, body: undefined, cause: undefined}});
      expect(JSON.stringify(result)).not.toContain(secret);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await provider()).toMatch(/^ek-/);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('sanitizes network causes and invalid JSON responses before allowing retry', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>()
      .mockRejectedValueOnce(new Error(`network ${secret}`))
      .mockResolvedValueOnce(new Response(`{"signing_secret":"${secret}"`, {headers: {'content-type': 'application/json'}}))
      .mockResolvedValueOnce(response());
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const networkError = await provider().catch((value: unknown) => value);
    expect(networkError).toMatchObject({code: 'network', cause: undefined, body: undefined});
    expect(String(networkError)).not.toContain(secret);
    const jsonError = await provider().catch((value: unknown) => value);
    expect(jsonError).toMatchObject({code: 'invalid-response', cause: undefined, body: undefined, status: 200});
    expect(JSON.stringify(jsonError)).not.toContain(secret);
    expect(await provider()).toMatch(/^ek-/);
  });

  it.each([undefined, 50])('bounds secret acquisition with its independent timeout (%s) even if fetch ignores abort', async signingSecretTimeoutMs => {
    let signal: AbortSignal | undefined;
    const fetch = vi.fn<typeof globalThis.fetch>()
      .mockImplementationOnce(request => {
        signal = (request as Request).signal;
        return new Promise(() => undefined);
      })
      .mockResolvedValueOnce(response());
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch, signingSecretTimeoutMs});
    const pending = provider();
    const rejection = expect(pending).rejects.toMatchObject({code: 'authentication', message: 'Signing-secret request timed out.', cause: undefined});
    await vi.advanceTimersByTimeAsync((signingSecretTimeoutMs ?? 30_000) - 1);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(signal?.aborted).toBe(true);
    expect(await provider()).toMatch(/^ek-/);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    {tokenType: 'unknown'}, {tokenType: 'user'}, {tokenType: 'user', baseUrl: ''},
    {tokenType: 'user', baseUrl: 'file:///secret'},
    {baseUrl}, {fetch: () => undefined}, {headers: {}}, {signingSecretTimeoutMs: 30},
    {tokenType: 'user', baseUrl, headers: {'bad\nname': 'x'}},
    ...[0, -1, 1.5, Infinity, Number.NaN, 2_147_483_648].map(signingSecretTimeoutMs => ({tokenType: 'user', baseUrl, signingSecretTimeoutMs})),
  ])('rejects invalid or misplaced signing options (%j)', extra => {
    expect(() => createZAITokenProvider(options({credentials, ...extra}))).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it.each([
    {tokenType: 'admin'}, {tokenType: 'user'}, {baseUrl}, {fetch: () => undefined}, {headers: {}}, {signingSecretTimeoutMs: 30},
  ])('does not allow signing options with fetchToken (%j)', extra => {
    expect(() => createZAITokenProvider(options({fetchToken: () => ({token: 'x', expiresAt: epoch + 1000}), ...extra}))).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});
