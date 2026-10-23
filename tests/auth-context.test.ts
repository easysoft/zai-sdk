import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAITokenProvider} from '../src/auth.js';
import type {ZAIToken, ZAITokenAcquisitionContext} from '../src/auth.js';
import {createZAIClient} from '../src/client.js';
import {createTransport} from '../src/transport.js';
import type {CreateZAIClientOptions, ZAIAuthContext} from '../src/types.js';

const baseUrl = 'https://zai.test/v1/zai';
const identity = {appID: 'app', userID: 'user'};
const epoch = 1_893_456_000;
const token = (value = 'token'): ZAIToken => ({token: value, expiresAt: Math.floor(Date.now() / 1000) + 100});
const fetchOK = () => vi.fn<typeof globalThis.fetch>(async () => Response.json({ok: true}));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {resolve = done;});
  return {promise, resolve};
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(epoch * 1000);});
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

describe('request authentication context', () => {
  it('provides normalized URL, route template, selected purpose and the original business signal', async () => {
    const getToken = vi.fn((_context: ZAIAuthContext) => 'opaque-token');
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl: `${baseUrl}///`, identity, getToken, fetch});
    const controller = new AbortController();
    await client.agents.get('agent/with spaces', {signal: controller.signal});
    expect(getToken.mock.calls[0]![0]).toEqual({
      purpose: 'user', baseUrl, method: 'GET', path: '/agents/{agent_id}', signal: controller.signal, identity,
    });
    await client.settings.models.list({tokenType: 'admin'});
    expect(getToken.mock.calls[1]![0]).toMatchObject({purpose: 'admin', method: 'GET', path: '/models'});
    await client.coding.runners.list();
    expect(getToken.mock.calls[2]![0]).toMatchObject({purpose: 'admin', method: 'GET', path: '/coding/runners'});
    expect(getToken.mock.calls[1]![0]).not.toBe(getToken.mock.calls[2]![0]);
  });

  it.each(['get', 'post', 'put', 'patch', 'delete'] as const)('uses uppercase %s method metadata', async method => {
    const getToken = vi.fn((_context: ZAIAuthContext) => 'token');
    const transport = createTransport({baseUrl, getToken, fetch: fetchOK()});
    await transport.request({method, path: '/example/{id}', pathParams: {id: 'one'}, auth: 'user'});
    expect(getToken.mock.calls[0]![0]).toMatchObject({method: method.toUpperCase(), path: '/example/{id}'});
  });

  it('resolves browser-relative roots before invoking the token callback', async () => {
    vi.stubGlobal('location', {href: 'https://browser.test/application/index.html'});
    const getToken = vi.fn((_context: ZAIAuthContext) => 'token');
    const client = createZAIClient({baseUrl: '/v1/zai/', getToken, fetch: fetchOK()});
    await client.agents.list();
    expect(getToken.mock.calls[0]![0].baseUrl).toBe('https://browser.test/v1/zai');
  });

  it('freezes context and a minimal identity snapshot without including caller credentials or payloads', async () => {
    const original = {...identity, appKey: 'private-key', signingSecret: 'private-secret'};
    const getToken = vi.fn((_context: ZAIAuthContext) => 'token');
    const client = createZAIClient({baseUrl, identity: original, getToken, fetch: fetchOK(), headers: {'x-private': 'private-header'}});
    original.appID = 'changed'; original.userID = 'changed';
    await client.messages.send('session', {content: [{type: 'input_text', text: 'private-content'}]});
    const context = getToken.mock.calls[0]![0];
    expect(context.identity).toEqual(identity);
    expect(context.identity).not.toBe(original);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.identity)).toBe(true);
    expect(() => {(context as {purpose: string}).purpose = 'admin';}).toThrow(TypeError);
    expect(() => {(context.identity as {userID: string}).userID = 'other';}).toThrow(TypeError);
    expect(Object.keys(context).sort()).toEqual(['baseUrl', 'identity', 'method', 'path', 'purpose']);
    expect(JSON.stringify(context)).not.toMatch(/private-key|private-secret|private-header|private-content/);
  });

  it('keeps identity bound to each client even when token callbacks are shared', async () => {
    const contexts: ZAIAuthContext[] = [];
    const getToken = (context: ZAIAuthContext) => {contexts.push(context); return 'token';};
    const first = createZAIClient({baseUrl, identity, getToken, fetch: fetchOK()});
    const second = createZAIClient({baseUrl, identity: {appID: 'other-app', userID: 'other-user'}, getToken, fetch: fetchOK()});
    await Promise.all([first.agents.list(), second.agents.list()]);
    expect(contexts.map(context => context.identity)).toEqual([identity, {appID: 'other-app', userID: 'other-user'}]);
    expect(contexts[0]!.identity).not.toBe(contexts[1]!.identity);
  });

  it('leaves identity absent when a custom caller does not bind one', async () => {
    const getToken = vi.fn((_context: ZAIAuthContext) => 'token');
    const client = createZAIClient({baseUrl, getToken, fetch: fetchOK()});
    await client.agents.list();
    expect(getToken.mock.calls[0]![0].identity).toBeUndefined();
  });

  it.each([null, 'user', {}, {appID: 'app'}, {userID: 'user'}, {appID: '', userID: 'user'}, {appID: 'app', userID: ''}, {appID: 42, userID: 'user'}])(
    'rejects invalid bound identity before requesting a token (%j)', invalidIdentity => {
      const getToken = vi.fn(() => 'token');
      expect(() => createZAIClient({baseUrl, identity: invalidIdentity, getToken} as CreateZAIClientOptions)).toThrow(expect.objectContaining({code: 'invalid-input'}));
      expect(getToken).not.toHaveBeenCalled();
    },
  );

  it('rejects a separate identity in automatic mode rather than accepting conflicting identities', () => {
    expect(() => createZAIClient({baseUrl, auth: {mode: 'auto', ...identity, appKey: 'key'}, identity: {appID: 'other', userID: 'other'}} as unknown as CreateZAIClientOptions))
      .toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it('does not invoke the callback after synchronous cancellation before its first microtask', async () => {
    const getToken = vi.fn((_context: ZAIAuthContext) => 'token');
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, getToken, fetch});
    const controller = new AbortController();
    const pending = client.agents.list({signal: controller.signal});
    controller.abort('cancel immediately');
    await expect(pending).rejects.toMatchObject({code: 'aborted', cause: 'cancel immediately'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('delivers cancellation through the original business signal to a running custom callback', async () => {
    const source = deferred<string>();
    let context!: ZAIAuthContext;
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, fetch, getToken: value => {context = value; return source.promise;}});
    const controller = new AbortController();
    const pending = client.agents.list({signal: controller.signal});
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await rejected;
    expect(context.signal).toBe(controller.signal);
    expect(context.signal?.aborted).toBe(true);
    source.resolve('late-token');
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('shared token acquisition context', () => {
  it('tracks initial, refresh and invalidated reasons while retaining each reason across failure', async () => {
    const contexts: ZAITokenAcquisitionContext[] = [];
    const provider = createZAITokenProvider({refreshBeforeSeconds: 0, fetchToken: context => {
      contexts.push(context);
      if (contexts.length % 2 === 1) throw new Error('temporary failure');
      return token(`token-${contexts.length}`);
    }});
    await expect(provider()).rejects.toMatchObject({code: 'authentication'});
    expect(await provider()).toBe('token-2');
    vi.setSystemTime((epoch + 100) * 1000);
    await expect(provider()).rejects.toMatchObject({code: 'authentication'});
    expect(await provider()).toBe('token-4');
    provider.invalidate();
    await expect(provider()).rejects.toMatchObject({code: 'authentication'});
    expect(await provider()).toBe('token-6');
    expect(contexts.map(context => context.reason)).toEqual(['initial', 'initial', 'refresh', 'refresh', 'invalidated', 'invalidated']);
    expect(new Set(contexts.map(context => context.signal)).size).toBe(6);
    for (const context of contexts) {
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.keys(context).sort()).toEqual(['reason', 'signal']);
      expect(context.signal).toBeInstanceOf(AbortSignal);
      expect(context.signal.aborted).toBe(false);
    }
  });

  it.each(['initial', 'refresh', 'invalidated'] as const)('preserves %s after timeout and ignores late completion', async reason => {
    const old = deferred<ZAIToken>();
    const contexts: ZAITokenAcquisitionContext[] = [];
    let stall = false;
    const provider = createZAITokenProvider({refreshBeforeSeconds: 0, acquireTimeoutMs: 10, fetchToken: context => {
      contexts.push(context);
      return stall ? old.promise : token('current');
    }});
    if (reason !== 'initial') {
      await provider();
      if (reason === 'refresh') vi.setSystemTime((epoch + 100) * 1000);
      else provider.invalidate();
    }
    stall = true;
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'authentication'});
    await vi.advanceTimersByTimeAsync(10);
    await rejected;
    const expiredContext = contexts.at(-1)!;
    expect(expiredContext.reason).toBe(reason);
    expect(expiredContext.signal.aborted).toBe(true);
    stall = false;
    expect(await provider()).toBe('current');
    expect(contexts.at(-1)!.reason).toBe(reason);
    old.resolve(token('stale'));
    await vi.advanceTimersByTimeAsync(0);
    expect(await provider()).toBe('current');
    vi.setSystemTime(Date.now() + 100_000);
    expect(await provider()).toBe('current');
    expect(contexts.at(-1)!.reason).toBe('refresh');
  });

  it('keeps invalidated reason when a replaced initial acquisition completes late', async () => {
    const old = deferred<ZAIToken>();
    const next = deferred<ZAIToken>();
    const contexts: ZAITokenAcquisitionContext[] = [];
    const provider = createZAITokenProvider({fetchToken: context => {
      contexts.push(context);
      return contexts.length === 1 ? old.promise : next.promise;
    }});
    const initial = provider();
    const rejected = expect(initial).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider.invalidate();
    await rejected;
    const refreshed = provider();
    await vi.advanceTimersByTimeAsync(0);
    old.resolve(token('stale'));
    await vi.advanceTimersByTimeAsync(0);
    expect(provider()).toBe(refreshed);
    expect(contexts.map(context => context.reason)).toEqual(['initial', 'invalidated']);
    expect(contexts[0]!.signal.aborted).toBe(true);
    expect(contexts[1]!.signal.aborted).toBe(false);
    next.resolve(token('fresh'));
    expect(await refreshed).toBe('fresh');
  });

  it('does not expose or cancel shared acquisition context when only one business waiter is cancelled', async () => {
    const source = deferred<ZAIToken>();
    const contexts: ZAITokenAcquisitionContext[] = [];
    const provider = createZAITokenProvider({fetchToken: context => {contexts.push(context); return source.promise;}});
    const fetch = fetchOK();
    const client = createZAIClient({baseUrl, identity, fetch, getToken: provider});
    const controller = new AbortController();
    const cancelled = client.agents.list({signal: controller.signal});
    const rejected = expect(cancelled).rejects.toMatchObject({code: 'aborted'});
    const continuing = client.agents.list();
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await rejected;
    expect(contexts).toHaveLength(1);
    expect(contexts[0]!.signal).not.toBe(controller.signal);
    expect(contexts[0]!.signal.aborted).toBe(false);
    source.resolve(token());
    await expect(continuing).resolves.toEqual({ok: true});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('aborts the acquisition context on disposal and cannot use its late result', async () => {
    const source = deferred<ZAIToken>();
    const contexts: ZAITokenAcquisitionContext[] = [];
    const provider = createZAITokenProvider({fetchToken: context => {contexts.push(context); return source.promise;}});
    const pending = provider();
    const rejected = expect(pending).rejects.toMatchObject({code: 'aborted'});
    await vi.advanceTimersByTimeAsync(0);
    provider.dispose();
    await rejected;
    expect(contexts[0]!.signal.aborted).toBe(true);
    source.resolve(token('late'));
    await vi.advanceTimersByTimeAsync(0);
    await expect(provider()).rejects.toMatchObject({code: 'aborted'});
    expect(contexts).toHaveLength(1);
  });

  it('passes frozen acquisition context to dynamic secret sources and retains the cache until explicit rotation', async () => {
    const contexts: ZAITokenAcquisitionContext[] = [];
    const provider = createZAITokenProvider({credentials: {...identity, getSigningSecret: context => {
      contexts.push(context);
      if (contexts.length === 1) throw new Error('temporary failure');
      return 'secret';
    }}, tokenType: 'user'});
    await expect(provider()).rejects.toMatchObject({code: 'authentication'});
    await provider();
    provider.invalidate();
    await provider();
    expect(contexts).toHaveLength(2);
    provider.invalidate({signingSecret: true});
    await provider();
    expect(contexts.map(context => context.reason)).toEqual(['initial', 'initial', 'invalidated']);
    for (const context of contexts) {
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.keys(context).sort()).toEqual(['reason', 'signal']);
      expect(context.signal).toBeInstanceOf(AbortSignal);
    }
  });
});
