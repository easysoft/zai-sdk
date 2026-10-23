import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAIToken, createZAITokenProvider} from '../src/auth.js';
import type {ZAIToken} from '../src/auth.js';
import {createZAIClient} from '../src/client.js';
import {ZAIClientError} from '../src/errors.js';

const credentials = {appID: 'app', appKey: 'app-key', userID: 'user'};
const baseUrl = 'https://zai.test/v1/zai';
const epoch = 1_893_456_000;
const backendToken = (token: string): ZAIToken => ({token, expiresAt: epoch + 1000});
const secretResponse = (secret: string): Response => Response.json({app_id: credentials.appID, signing_secret: secret, token_prefix: 'ek-'});
const expectedUserToken = (secret: string, seconds = 0): string => `ek-${createZAIToken(credentials.appID, secret, credentials.userID, epoch + seconds + 1000).slice(3)}`;
const pathname = (input: RequestInfo | URL): string => new URL((input as Request).url).pathname;
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {resolve = done; reject = fail;});
  return {promise, resolve, reject};
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(epoch * 1000);});
afterEach(() => {vi.useRealTimers();});

describe('token provider lifecycle', () => {
  it('clears an external token lazily and shares its next acquisition', async () => {
    const fetchToken = vi.fn().mockResolvedValueOnce(backendToken('old')).mockResolvedValue(backendToken('new'));
    const provider = createZAITokenProvider({fetchToken});
    expect(await provider()).toBe('old');
    provider.invalidate();
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(await Promise.all([provider(), provider()])).toEqual(['new', 'new']);
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it.each(['resolve', 'reject'] as const)('rejects old waiters and ignores a late source %s without clearing new pending work', async completion => {
    const old = deferred<ZAIToken>();
    const fresh = deferred<ZAIToken>();
    const fetchToken = vi.fn().mockReturnValueOnce(old.promise).mockReturnValue(fresh.promise);
    const provider = createZAITokenProvider({fetchToken});
    const oldWaiters = Promise.allSettled([provider(), provider()]);
    await vi.advanceTimersByTimeAsync(0);
    provider.invalidate();
    const next = provider();
    const results = await oldWaiters;
    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result).toMatchObject({status: 'rejected', reason: {code: 'aborted'}});
      if (result.status === 'rejected') expect(result.reason).toBeInstanceOf(ZAIClientError);
    }
    await vi.advanceTimersByTimeAsync(0);
    if (completion === 'resolve') old.resolve(backendToken('stale'));
    else old.reject(new Error('stale failure'));
    await vi.advanceTimersByTimeAsync(0);
    const concurrent = provider();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchToken).toHaveBeenCalledTimes(2);
    fresh.resolve(backendToken('fresh'));
    expect(await Promise.all([next, concurrent])).toEqual(['fresh', 'fresh']);
    expect(await provider()).toBe('fresh');
  });

  it.each(['invalidate', 'dispose'] as const)('does not start token acquisition after %s before its first microtask', async method => {
    const fetchToken = vi.fn().mockResolvedValue(backendToken('token'));
    const provider = createZAITokenProvider({fetchToken});
    const result = provider();
    const rejected = expect(result).rejects.toMatchObject({code: 'aborted'});
    provider[method]();
    await rejected;
    expect(fetchToken).not.toHaveBeenCalled();
    if (method === 'invalidate') expect(await provider()).toBe('token');
    else await expect(provider()).rejects.toMatchObject({code: 'aborted'});
  });

  it('permanently disposes a provider with a cached token', async () => {
    const fetchToken = vi.fn().mockResolvedValue(backendToken('token'));
    const provider = createZAITokenProvider({fetchToken});
    await provider();
    provider.dispose();
    provider.dispose();
    provider.invalidate({signingSecret: true});
    await expect(provider()).rejects.toMatchObject({code: 'aborted'});
    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  it('rejects an active acquisition immediately on disposal and cannot cache its late result', async () => {
    const source = deferred<ZAIToken>();
    const fetchToken = vi.fn().mockReturnValue(source.promise);
    const provider = createZAITokenProvider({fetchToken});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider.dispose();
    await rejected;
    source.resolve(backendToken('stale'));
    await vi.advanceTimersByTimeAsync(0);
    provider.invalidate();
    await expect(provider()).rejects.toMatchObject({code: 'aborted'});
    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  it('invalidates locally signed administrator tokens and keeps instances isolated', async () => {
    const first = createZAITokenProvider({credentials});
    const second = createZAITokenProvider({credentials});
    const original = await first();
    expect(await second()).toBe(original);
    vi.setSystemTime((epoch + 1) * 1000);
    first.invalidate();
    expect(await first()).not.toBe(original);
    expect(await second()).toBe(original);
    first.dispose();
    expect(await second()).toBe(original);
    await expect(first()).rejects.toMatchObject({code: 'aborted'});
  });
});

describe('signing-secret lifecycle', () => {
  it('retains the secret for token-only invalidation and retrieves a rotated secret only when requested', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValueOnce(secretResponse('old-secret')).mockResolvedValueOnce(secretResponse('new-secret'));
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    expect(await provider()).toBe(expectedUserToken('old-secret'));
    vi.setSystemTime((epoch + 1) * 1000);
    provider.invalidate();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await provider()).toBe(expectedUserToken('old-secret', 1));
    expect(fetch).toHaveBeenCalledTimes(1);
    provider.invalidate({signingSecret: true});
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await provider()).toBe(expectedUserToken('new-secret', 1));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([false, true])('aborts pending secret retrieval and cannot restore a stale secret after invalidate(%s)', async signingSecret => {
    const old = deferred<Response>();
    const fresh = deferred<Response>();
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(input => {
      requests.push(input as Request);
      return requests.length === 1 ? old.promise : fresh.promise;
    });
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider.invalidate({signingSecret});
    expect(requests[0]!.signal.aborted).toBe(true);
    await rejected;
    const next = provider();
    await vi.advanceTimersByTimeAsync(0);
    old.resolve(secretResponse('stale-secret'));
    await vi.advanceTimersByTimeAsync(0);
    const concurrent = provider();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(2);
    fresh.resolve(secretResponse('fresh-secret'));
    expect(await Promise.all([next, concurrent])).toEqual([expectedUserToken('fresh-secret'), expectedUserToken('fresh-secret')]);
    vi.setSystemTime((epoch + 1) * 1000);
    provider.invalidate();
    expect(await provider()).toBe(expectedUserToken('fresh-secret', 1));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('disposes an active secret request and releases its timeout', async () => {
    const source = deferred<Response>();
    let request: Request | undefined;
    const fetch = vi.fn<typeof globalThis.fetch>(input => {request = input as Request; return source.promise;});
    const provider = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider.dispose();
    await rejected;
    expect(request?.signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    source.resolve(secretResponse('stale-secret'));
    await vi.advanceTimersByTimeAsync(0);
    await expect(provider()).rejects.toMatchObject({code: 'aborted'});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('client authentication ownership', () => {
  it('invalidates both automatic token types and refreshes their secret lazily', async () => {
    let secret = 'first-secret';
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      requests.push(input as Request);
      return pathname(input).endsWith('/signing_secret') ? secretResponse(secret) : Response.json({ok: true});
    });
    const client = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch});
    await client.agents.list();
    await client.settings.models.list({tokenType: 'admin'});
    const oldAdmin = requests.at(-1)!.headers.get('authorization');
    vi.setSystemTime((epoch + 1) * 1000);
    client.auth!.invalidate();
    expect(fetch).toHaveBeenCalledTimes(3);
    await client.agents.list();
    expect(requests.at(-1)!.headers.get('authorization')).toBe(`Bearer ${expectedUserToken(secret, 1)}`);
    await client.settings.models.list({tokenType: 'admin'});
    expect(requests.at(-1)!.headers.get('authorization')).not.toBe(oldAdmin);
    secret = 'rotated-secret';
    client.auth!.invalidate({signingSecret: true});
    expect(fetch).toHaveBeenCalledTimes(5);
    await client.agents.list();
    expect(requests.at(-1)!.headers.get('authorization')).toBe(`Bearer ${expectedUserToken(secret, 1)}`);
    expect(requests.filter(request => pathname(request).endsWith('/signing_secret'))).toHaveLength(2);
  });

  it('keeps automatic lifecycle controls isolated between clients', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async input => pathname(input).endsWith('/signing_secret') ? secretResponse('secret') : Response.json({ok: true}));
    const first = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch});
    const second = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch});
    await Promise.all([first.agents.list(), second.agents.list()]);
    first.auth!.invalidate({signingSecret: true});
    await second.agents.list();
    expect(fetch.mock.calls.filter(([input]) => pathname(input).endsWith('/signing_secret'))).toHaveLength(2);
    first.auth!.dispose();
    first.auth!.invalidate();
    await expect(first.agents.list()).rejects.toMatchObject({code: 'aborted'});
    await expect(first.settings.models.list({tokenType: 'admin'})).rejects.toMatchObject({code: 'aborted'});
    await expect(second.agents.list()).resolves.toEqual({ok: true});
  });

  it('does not cancel business requests already sent when automatic authentication is disposed', async () => {
    const started = deferred<void>();
    const response = deferred<Response>();
    let businessSignal: AbortSignal | undefined;
    const fetch = vi.fn<typeof globalThis.fetch>(input => {
      if (pathname(input).endsWith('/signing_secret')) return Promise.resolve(secretResponse('secret'));
      businessSignal = (input as Request).signal;
      started.resolve();
      return response.promise;
    });
    const client = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch});
    const pending = client.agents.list();
    await started.promise;
    client.auth!.dispose();
    expect(businessSignal?.aborted).toBe(false);
    response.resolve(Response.json({ok: true}));
    await expect(pending).resolves.toEqual({ok: true});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'aborted'});
  });

  it('leaves caller-supplied token provider ownership with its caller', async () => {
    const provider = createZAITokenProvider({fetchToken: () => backendToken('token')});
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ok: true}));
    const client = createZAIClient({baseUrl, getToken: provider, fetch});
    expect(client.auth).toBeUndefined();
    await client.agents.list();
    provider.dispose();
    await expect(client.agents.list()).rejects.toMatchObject({code: 'aborted'});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
