import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAITokenProvider} from '../src/auth.js';
import type {ZAIToken, ZAITokenAcquisitionContext, ZAITokenProviderOptions} from '../src/auth.js';
import {createZAIClient} from '../src/client.js';
import {ZAIClientError} from '../src/errors.js';

const epoch = 1_893_456_000;
const token = (value = 'token'): ZAIToken => ({token: value, expiresAt: epoch + 1000});
const options = (value: unknown): ZAITokenProviderOptions => value as ZAITokenProviderOptions;
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {resolve = done; reject = fail;});
  return {promise, resolve, reject};
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(epoch * 1000);});
afterEach(() => {vi.useRealTimers();});

describe('external token acquisition timeout', () => {
  it.each([undefined, 25])('uses the default or configured timeout (%s) and aborts the shared source', async acquireTimeoutMs => {
    const source = deferred<ZAIToken>();
    let sourceSignal: AbortSignal | undefined;
    const provider = createZAITokenProvider({fetchToken: ({signal}) => {sourceSignal = signal; return source.promise;}, acquireTimeoutMs});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'authentication', message: 'Token acquisition timed out.'});
    let settled = false;
    void pending.then(() => {settled = true;}, () => {settled = true;});
    await vi.advanceTimersByTimeAsync((acquireTimeoutMs ?? 30_000) - 1);
    expect(sourceSignal).toBeInstanceOf(AbortSignal);
    expect(sourceSignal?.aborted).toBe(false);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejected;
    expect(sourceSignal?.aborted).toBe(true);
    expect(sourceSignal?.reason).toBeInstanceOf(ZAIClientError);
    expect(sourceSignal?.reason).toMatchObject({code: 'authentication', message: 'Token acquisition timed out.'});
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one timeout across concurrent waiters and retries with a new signal', async () => {
    const signals: AbortSignal[] = [];
    const source = deferred<ZAIToken>();
    const fetchToken = vi.fn(({signal}: ZAITokenAcquisitionContext) => {
      signals.push(signal);
      return signals.length === 1 ? source.promise : token('recovered');
    });
    const provider = createZAITokenProvider({fetchToken, acquireTimeoutMs: 10});
    const results = Promise.allSettled([provider(), provider(), provider()]);
    await vi.advanceTimersByTimeAsync(10);
    const settled = await results;
    for (const result of settled) expect(result).toMatchObject({status: 'rejected', reason: {code: 'authentication', message: 'Token acquisition timed out.'}});
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(signals[0]!.aborted).toBe(true);
    expect(await provider()).toBe('recovered');
    expect(signals[1]!.aborted).toBe(false);
    expect(signals[1]).not.toBe(signals[0]);
    expect(await provider()).toBe('recovered');
    expect(fetchToken).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['resolve', 'reject'] as const)('ignores a late source %s after timeout without overwriting new pending work or cache', async completion => {
    const old = deferred<ZAIToken>();
    const fresh = deferred<ZAIToken>();
    const fetchToken = vi.fn().mockReturnValueOnce(old.promise).mockReturnValue(fresh.promise);
    const provider = createZAITokenProvider({fetchToken, acquireTimeoutMs: 10});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'authentication', message: 'Token acquisition timed out.'});
    await vi.advanceTimersByTimeAsync(10);
    await rejected;
    const next = provider();
    await vi.advanceTimersByTimeAsync(0);
    if (completion === 'resolve') old.resolve(token('stale'));
    else old.reject(new Error('late backend failure'));
    await vi.advanceTimersByTimeAsync(0);
    const concurrent = provider();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchToken).toHaveBeenCalledTimes(2);
    fresh.resolve(token('fresh'));
    expect(await Promise.all([next, concurrent])).toEqual(['fresh', 'fresh']);
    expect(await provider()).toBe('fresh');
    expect(fetchToken).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves the timeout error when an abort-aware source rejects during cancellation', async () => {
    const provider = createZAITokenProvider({
      acquireTimeoutMs: 10,
      fetchToken: ({signal}) => new Promise<ZAIToken>((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('backend cancelled', 'AbortError')), {once: true});
      }),
    });
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'authentication', message: 'Token acquisition timed out.', cause: undefined});
    await vi.advanceTimersByTimeAsync(10);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['success', 'failure', 'invalid'] as const)('releases the acquisition timer after source %s', async result => {
    let sourceSignal: AbortSignal | undefined;
    const provider = createZAITokenProvider({
      acquireTimeoutMs: 10,
      fetchToken: ({signal}) => {
        sourceSignal = signal;
        if (result === 'failure') return Promise.reject(new Error('backend unavailable'));
        return result === 'invalid' ? {...token(), token: ''} : token();
      },
    });
    if (result === 'success') await expect(provider()).resolves.toBe('token');
    else await expect(provider()).rejects.toMatchObject({code: 'authentication'});
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(20);
    expect(sourceSignal?.aborted).toBe(false);
  });

  it.each(['invalidate', 'dispose'] as const)('aborts the source signal and releases its timer on %s', async method => {
    const source = deferred<ZAIToken>();
    let sourceSignal: AbortSignal | undefined;
    const provider = createZAITokenProvider({fetchToken: ({signal}) => {sourceSignal = signal; return source.promise;}, acquireTimeoutMs: 10});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider[method]();
    await rejected;
    expect(sourceSignal?.aborted).toBe(true);
    expect(sourceSignal?.reason).toMatchObject({code: 'aborted'});
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a business waiter independently while another request completes with the shared token', async () => {
    const source = deferred<ZAIToken>();
    let sourceSignal: AbortSignal | undefined;
    const fetchToken = vi.fn(({signal}: ZAITokenAcquisitionContext) => {sourceSignal = signal; return source.promise;});
    const provider = createZAITokenProvider({fetchToken, acquireTimeoutMs: 100});
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ok: true}));
    const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: provider, fetch});
    const controller = new AbortController();
    const cancelled = client.agents.list({signal: controller.signal});
    const rejected = expect(cancelled).rejects.toMatchObject({code: 'aborted', cause: 'cancel this request'});
    const continuing = client.agents.list();
    await vi.advanceTimersByTimeAsync(0);
    controller.abort('cancel this request');
    await rejected;
    expect(sourceSignal).not.toBe(controller.signal);
    expect(sourceSignal?.aborted).toBe(false);
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
    source.resolve(token());
    await expect(continuing).resolves.toEqual({ok: true});
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sourceSignal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('external token timeout validation', () => {
  it.each([0, -1, 0.5, NaN, Infinity, 2_147_483_648, Number.MAX_SAFE_INTEGER, '100'])('rejects invalid acquireTimeoutMs (%s)', acquireTimeoutMs => {
    expect(() => createZAITokenProvider(options({fetchToken: () => token(), acquireTimeoutMs})))
      .toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it.each([1, 2_147_483_647])('accepts the supported timeout boundary (%s)', acquireTimeoutMs => {
    expect(() => createZAITokenProvider({fetchToken: () => token(), acquireTimeoutMs})).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['admin', 'user'])('rejects external acquisition timeout on local %s token providers', tokenType => {
    expect(() => createZAITokenProvider(options({
      credentials: {appID: 'app', appKey: 'key', userID: 'user'},
      tokenType, ...(tokenType === 'user' ? {baseUrl: 'https://zai.test/v1/zai'} : {}), acquireTimeoutMs: 100,
    }))).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });
});
