import {inspect} from 'node:util';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAITokenProvider} from '../src/auth.js';
import type {ZAIToken, ZAITokenAcquisitionContext} from '../src/auth.js';
import {createZAIClient} from '../src/client.js';
import {ZAIClientError} from '../src/errors.js';
import type {ZAIAuthContext} from '../src/types.js';

const baseUrl = 'https://zai.test/v1/zai';
const secret = 'credential-secret-do-not-expose';
const epoch = 1_893_456_000;
const token = (): ZAIToken => ({token: 'safe-token', expiresAt: epoch + 1000});
const fetchOK = () => vi.fn<typeof globalThis.fetch>(async () => Response.json({ok: true}));
const responseThrowing = (error: unknown): Response => new class extends Response {
  override get ok(): boolean {throw error;}
}();
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {resolve = done;});
  return {promise, resolve};
};
const sensitiveError = (code: 'authentication' | 'invalid-input' | 'aborted'): ZAIClientError => new ZAIClientError(code, secret, {
  cause: new Error(secret), status: 401, method: secret, path: `/${secret}`,
  headers: new Headers({authorization: `Bearer ${secret}`, 'x-secret': secret}),
  body: {secret, error_info: {code: secret, message: secret, reason_code: secret, user_message: secret, details: {secret}}},
});
const verifySafe = (error: unknown, code = 'authentication', metadata: {status?: number; method?: string; path?: string} = {}): void => {
  expect(error).toBeInstanceOf(ZAIClientError);
  expect(error).toMatchObject({code, cause: undefined, body: undefined, headers: undefined, status: undefined, errorInfo: undefined, method: undefined, path: undefined, ...metadata});
  const visible = [String(error), JSON.stringify(error), inspect(error, {depth: null}), inspect(error, {showHidden: true, depth: null})].join('\n');
  expect(visible).not.toContain(secret);
};
const poison = (error: unknown): void => {
  Object.assign(error as object, {
    code: 'invalid-input', message: secret, stack: secret, cause: new Error(secret),
    body: {secret}, headers: new Headers({authorization: secret}), status: 401,
    method: secret, path: secret, errorInfo: {message: secret},
  });
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(epoch * 1000);});
afterEach(() => {vi.useRealTimers();});

describe.each([
  ['Error', (): Error => new Error(secret)],
  ['string', (): string => secret],
  ['authentication error', () => sensitiveError('authentication')],
  ['forged invalid-input error', () => sensitiveError('invalid-input')],
  ['forged aborted error', () => sensitiveError('aborted')],
] as const)('authentication source error redaction: %s', (_label, failure) => {
  it.each([false, true])('sanitizes external fetchToken errors and permits retry (async: %s)', async asynchronous => {
    const original = failure();
    const fetchToken = vi.fn<(context: ZAITokenAcquisitionContext) => ZAIToken | Promise<ZAIToken>>()
      .mockImplementationOnce(() => {if (asynchronous) return Promise.reject(original); throw original;})
      .mockReturnValue(token());
    const provider = createZAITokenProvider({fetchToken});
    const error = await provider().catch((value: unknown) => value);
    verifySafe(error);
    expect(error).not.toBe(original);
    expect(error).toHaveProperty('message', 'Failed to acquire a ZAI token.');
    expect(await provider()).toBe('safe-token');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])('sanitizes custom getToken errors before HTTP and permits retry (async: %s)', async asynchronous => {
    const original = failure();
    const getToken = vi.fn<(context: ZAIAuthContext) => string | Promise<string>>()
      .mockImplementationOnce(() => {if (asynchronous) return Promise.reject(original); throw original;})
      .mockReturnValue('safe-token');
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken, fetch});
    const error = await client.agents.list().catch((value: unknown) => value);
    verifySafe(error);
    expect(error).not.toBe(original);
    expect(error).toHaveProperty('message', 'Unable to obtain an authentication token.');
    expect(fetch).not.toHaveBeenCalled();
    await expect(client.agents.list()).resolves.toEqual({ok: true});
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('untrusted token result redaction', () => {
  it.each(['token', 'expiresAt'] as const)('sanitizes a throwing %s getter in the returned token', async property => {
    const original = sensitiveError('invalid-input');
    const result = Object.defineProperty(token(), property, {get() {throw original;}});
    const fetchToken = vi.fn().mockReturnValueOnce(result).mockReturnValue(token());
    const provider = createZAITokenProvider({fetchToken});
    const error = await provider().catch((value: unknown) => value);
    verifySafe(error);
    expect(error).not.toBe(original);
    expect(await provider()).toBe('safe-token');
  });

  it.each(['reject', 'throw-getter'] as const)('sanitizes a token source thenable that fails via %s', async mode => {
    const original = sensitiveError('aborted');
    const result = mode === 'reject'
      ? {then(_resolve: unknown, reject: (reason: unknown) => void) {reject(original);}}
      : Object.defineProperty({}, 'then', {get() {throw original;}});
    const provider = createZAITokenProvider({fetchToken: () => result as Promise<ZAIToken>});
    const providerError = await provider().catch((value: unknown) => value);
    verifySafe(providerError);
    expect(providerError).not.toBe(original);
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken: () => result as Promise<string>, fetch});
    const clientError = await client.agents.list().catch((value: unknown) => value);
    verifySafe(clientError);
    expect(clientError).not.toBe(original);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['newline', 'non-ByteString'] as const)('does not attach an Authorization-header failure cause for a %s token', async kind => {
    const invalidToken = `${secret}${kind === 'newline' ? '\n' : '\u0100'}suffix`;
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken: () => invalidToken, fetch});
    const error = await client.agents.list().catch((value: unknown) => value);
    verifySafe(error);
    expect(error).toHaveProperty('message', 'The token cannot be used as an authorization header.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shares a sanitized provider failure among concurrent callers without poisoning its next acquisition', async () => {
    const original = sensitiveError('invalid-input');
    const fetchToken = vi.fn().mockRejectedValueOnce(original).mockReturnValue(token());
    const provider = createZAITokenProvider({fetchToken});
    const first = provider();
    expect(provider()).toBe(first);
    const errors = await Promise.all([first, provider(), provider()].map(pending => pending.catch((value: unknown) => value)));
    for (const error of errors) {
      verifySafe(error);
      expect(error).not.toBe(original);
    }
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(await provider()).toBe('safe-token');
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });
});

describe('safe SDK-owned authentication failures', () => {
  it.each([401, 403, 503])('retains only safe signing-secret HTTP %s metadata through automatic authentication', async status => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({error: secret, signing_secret: secret}, {status, headers: {'x-secret': secret}}));
    const client = createZAIClient({baseUrl, auth: {mode: 'auto', appID: 'app', appKey: 'key', userID: 'user'}, fetch});
    const error = await client.agents.list().catch((value: unknown) => value);
    verifySafe(error, status === 503 ? 'http' : 'authentication', {status, method: 'GET', path: '/signing_secret'});
    expect(error).toHaveProperty('message', 'Unable to obtain the app signing secret.');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([99, 600, 401.5, secret])('discards invalid signing-secret status metadata (%s)', async status => {
    const original = sensitiveError('authentication');
    Object.assign(original, {status});
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(responseThrowing(original));
    const provider = createZAITokenProvider({credentials: {appID: 'app', userID: 'user', appKey: 'key'}, tokenType: 'user', baseUrl, fetch});
    const error = await provider().catch((value: unknown) => value);
    verifySafe(error, 'authentication', {method: 'GET', path: '/signing_secret'});
    expect(error).not.toBe(original);
  });

  it('does not preserve an unrecognized signing-secret error code', async () => {
    const original = sensitiveError('authentication');
    Object.assign(original, {code: secret});
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(responseThrowing(original));
    const provider = createZAITokenProvider({credentials: {appID: 'app', userID: 'user', appKey: 'key'}, tokenType: 'user', baseUrl, fetch});
    const error = await provider().catch((value: unknown) => value);
    verifySafe(error, 'authentication', {status: 401, method: 'GET', path: '/signing_secret'});
    expect(error).not.toBe(original);
  });

  it.each(['timeout', 'invalidate'] as const)('rebuilds a captured SDK %s error from its safe snapshot after external mutation', async trigger => {
    const provider = createZAITokenProvider({fetchToken: () => new Promise<ZAIToken>(() => undefined), acquireTimeoutMs: 10});
    const pending = provider().catch((value: unknown) => value);
    await vi.advanceTimersByTimeAsync(trigger === 'timeout' ? 10 : 0);
    if (trigger === 'invalidate') provider.invalidate();
    const captured = await pending;
    poison(captured);
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, fetch, getToken: () => {throw captured;}});
    const error = await client.agents.list().catch((value: unknown) => value);
    verifySafe(error, trigger === 'timeout' ? 'authentication' : 'aborted');
    expect(error).not.toBe(captured);
    expect(error).toHaveProperty('message', trigger === 'timeout' ? 'Token acquisition timed out.' : 'The token provider was invalidated.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['timeout', 'invalidate', 'dispose'] as const)('does not expose a shared signal reason poisoned by an abort listener during %s', async trigger => {
    let poisonedReason: unknown;
    const source = deferred<ZAIToken>();
    const provider = createZAITokenProvider({acquireTimeoutMs: 10, fetchToken: ({signal}) => {
      signal.addEventListener('abort', () => {poisonedReason = signal.reason; poison(poisonedReason);}, {once: true});
      return source.promise;
    }});
    const pending = provider().catch((value: unknown) => value);
    await vi.advanceTimersByTimeAsync(trigger === 'timeout' ? 10 : 0);
    if (trigger !== 'timeout') provider[trigger]();
    const error = await pending;
    verifySafe(error, trigger === 'timeout' ? 'authentication' : 'aborted');
    expect(error).not.toBe(poisonedReason);
    expect(error).toHaveProperty('message', trigger === 'timeout' ? 'Token acquisition timed out.'
      : trigger === 'invalidate' ? 'The token provider was invalidated.' : 'The token provider has been disposed.');
    source.resolve({token: secret, expiresAt: epoch + 1000});
    await vi.advanceTimersByTimeAsync(0);
  });

  it('preserves the shared provider timeout through a client and permits another acquisition', async () => {
    const source = deferred<ZAIToken>();
    const fetchToken = vi.fn().mockReturnValueOnce(source.promise).mockReturnValue(token());
    const provider = createZAITokenProvider({fetchToken, acquireTimeoutMs: 10});
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken: provider, fetch});
    const pending = client.agents.list().catch((value: unknown) => value);
    await vi.advanceTimersByTimeAsync(10);
    const error = await pending;
    verifySafe(error);
    expect(error).toHaveProperty('message', 'Token acquisition timed out.');
    expect(fetch).not.toHaveBeenCalled();
    await expect(client.agents.list()).resolves.toEqual({ok: true});
    source.resolve({token: secret, expiresAt: epoch + 1000});
    await vi.advanceTimersByTimeAsync(0);
    expect(await provider()).toBe('safe-token');
  });

  it.each(['invalidate', 'dispose'] as const)('preserves safe %s cancellation through a client and ignores late secrets', async method => {
    const source = deferred<ZAIToken>();
    const provider = createZAITokenProvider({fetchToken: () => source.promise});
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken: provider, fetch});
    const pending = client.agents.list().catch((value: unknown) => value);
    await vi.advanceTimersByTimeAsync(0);
    provider[method]();
    const error = await pending;
    verifySafe(error, 'aborted');
    expect(error).toHaveProperty('message', method === 'invalidate' ? 'The token provider was invalidated.' : 'The token provider has been disposed.');
    source.resolve({token: secret, expiresAt: epoch + 1000});
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).not.toHaveBeenCalled();
    if (method === 'dispose') {
      const disposed = await client.agents.list().catch((value: unknown) => value);
      verifySafe(disposed, 'aborted');
    }
  });

  it('preserves dynamic signing-secret redaction when its provider is used by a client', async () => {
    const original = sensitiveError('invalid-input');
    const getSigningSecret = vi.fn().mockRejectedValueOnce(original).mockReturnValue('safe-secret');
    const provider = createZAITokenProvider({credentials: {appID: 'app', userID: 'user', getSigningSecret}, tokenType: 'user'});
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken: provider, fetch});
    const error = await client.agents.list().catch((value: unknown) => value);
    verifySafe(error);
    expect(error).not.toBe(original);
    expect(fetch).not.toHaveBeenCalled();
    await expect(client.agents.list()).resolves.toEqual({ok: true});
    expect(getSigningSecret).toHaveBeenCalledTimes(2);
  });
});
