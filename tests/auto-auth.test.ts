import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createZAIClient} from '../src/client.js';
import {createTransport} from '../src/transport.js';
import type {CreateZAIClientOptions, ZAIOperationRequest} from '../src/types.js';

const baseUrl = 'https://zai.test/v1/zai';
const auth = {mode: 'auto' as const, appID: 'app', appKey: 'app-key', userID: 'user', userName: '用户😊'};
const secret = () => Response.json({app_id: auth.appID, signing_secret: 'user-secret', token_prefix: 'ek-'});
const ok = () => Response.json({ok: true});
const pathname = (request: Request): string => new URL(request.url).pathname;
const decode = (request: Request): Record<string, unknown> => JSON.parse(Buffer.from(request.headers.get('authorization')!.slice('Bearer ak-'.length), 'base64').toString('utf8'));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {resolve = done;});
  return {promise, resolve};
};

beforeEach(() => {vi.useFakeTimers(); vi.setSystemTime(1_893_456_000_000);});
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

describe('automatic authentication configuration', () => {
  it.each([
    {}, {auth, getToken: () => 'token'}, {auth: null}, {auth: 'auto'},
    {auth: {...auth, mode: 'manual'}}, {auth: {...auth, mode: undefined}},
    {auth: {...auth, appID: ''}}, {auth: {...auth, appKey: ''}}, {auth: {...auth, userID: ''}},
    {auth: {...auth, userName: 42}},
  ])('rejects absent, conflicting, or invalid authentication (%j)', extra => {
    expect(() => createZAIClient({baseUrl, ...extra} as CreateZAIClientOptions)).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it('normalizes invalid automatic-auth headers as invalid input', () => {
    expect(() => createZAIClient({baseUrl, auth, headers: {'bad\nname': 'value'}})).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it('preserves explicit token providers without inspecting their token prefix', async () => {
    const getToken = vi.fn(() => 'ek-external-opaque');
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      expect((input as Request).headers.get('authorization')).toBe('Bearer ek-external-opaque');
      return ok();
    });
    const client = createZAIClient({baseUrl, getToken, fetch});
    await client.settings.models.list();
    await client.agents.list();
    expect(getToken.mock.calls).toEqual([[true], [false]]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([undefined, 'unknown'])('fails closed before fetching when operation permission is %s', async permission => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => ok());
    const transport = createTransport({baseUrl, auth, fetch});
    await expect(transport.request({method: 'get', path: '/models', auth: permission} as ZAIOperationRequest))
      .rejects.toMatchObject({code: 'invalid-input'});
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('automatic token selection and acquisition lifecycle', () => {
  it('signs administrator requests locally without retrieving a signing secret', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      const request = input as Request;
      expect(request.headers.get('authorization')).toMatch(/^Bearer ak-/);
      expect(pathname(request)).toMatch(/^\/v1\/zai\/(models|coding\/runners)$/);
      return ok();
    });
    const client = createZAIClient({baseUrl, auth, fetch});
    expect(fetch).not.toHaveBeenCalled();
    await Promise.all([client.settings.models.list(), client.coding.runners.list()]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses the configured fetch and headers for shared secret retrieval and keeps original credentials', async () => {
    const mutableAuth = {...auth};
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      const request = input as Request;
      requests.push(request);
      return pathname(request).endsWith('/signing_secret') ? secret() : ok();
    });
    const globalFetch = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal('fetch', globalFetch);
    const client = createZAIClient({baseUrl, auth: mutableAuth, fetch, headers: {'x-tenant': 'app-tenant', authorization: 'ignored'}});
    mutableAuth.appID = 'other'; mutableAuth.appKey = 'other-key'; mutableAuth.userID = 'other-user'; mutableAuth.userName = 'other-name';
    await Promise.all(Array.from({length: 8}, () => client.agents.list({headers: {'x-request': 'business', authorization: 'also ignored'}})));
    await client.settings.models.list();
    const secretRequests = requests.filter(request => pathname(request).endsWith('/signing_secret'));
    expect(secretRequests).toHaveLength(1);
    expect(secretRequests[0]!.headers.get('authorization')).toMatch(/^Bearer ak-/);
    expect(secretRequests[0]!.headers.has('x-request')).toBe(false);
    for (const request of requests) {
      expect(request.headers.get('x-tenant')).toBe('app-tenant');
      expect(decode(request)).toMatchObject({app_id: auth.appID, user_id: auth.userID, user_name: auth.userName});
      if (pathname(request).endsWith('/agents')) {
        expect(request.headers.get('authorization')).toMatch(/^Bearer ek-/);
        expect(request.headers.get('x-request')).toBe('business');
      }
    }
    expect(globalFetch).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(10);
  });

  it('cancels one secret waiter without aborting the other waiter or shared request', async () => {
    const started = deferred<void>();
    const result = deferred<Response>();
    let secretSignal: AbortSignal | undefined;
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      const request = input as Request;
      if (pathname(request).endsWith('/signing_secret')) {
        secretSignal = request.signal;
        started.resolve();
        return result.promise;
      }
      return ok();
    });
    const client = createZAIClient({baseUrl, auth, fetch});
    const controller = new AbortController();
    const first = client.agents.list({signal: controller.signal});
    const second = client.agents.list();
    await started.promise;
    controller.abort('cancel first');
    await expect(first).rejects.toMatchObject({code: 'aborted', cause: 'cancel first'});
    expect(secretSignal?.aborted).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
    result.resolve(secret());
    await expect(second).resolves.toEqual({ok: true});
    await client.agents.list();
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not retrieve a secret for an already-cancelled request', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => ok());
    const client = createZAIClient({baseUrl, auth, fetch});
    const controller = new AbortController();
    controller.abort();
    await expect(client.agents.list({signal: controller.signal})).rejects.toMatchObject({code: 'aborted'});
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shares an acquisition failure and retries on the next business call', async () => {
    let attempts = 0;
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      if (pathname(input as Request).endsWith('/signing_secret')) {
        return ++attempts === 1 ? Response.json({error: 'temporarily unavailable'}, {status: 503}) : secret();
      }
      return ok();
    });
    const client = createZAIClient({baseUrl, auth, fetch});
    const results = await Promise.allSettled([client.agents.list(), client.agents.list()]);
    expect(results).toEqual([
      expect.objectContaining({status: 'rejected', reason: expect.objectContaining({code: 'http', status: 503, body: undefined, cause: undefined})}),
      expect.objectContaining({status: 'rejected', reason: expect.objectContaining({code: 'http', status: 503, body: undefined, cause: undefined})}),
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(client.agents.list()).resolves.toEqual({ok: true});
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it.each([401, 403])('does not upgrade or replay a failed user-token HTTP %s POST', async status => {
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async input => {
      const request = input as Request;
      requests.push(request);
      return pathname(request).endsWith('/signing_secret') ? secret() : Response.json({error: 'rejected'}, {status});
    });
    const client = createZAIClient({baseUrl, auth, fetch});
    await expect(client.messages.send('session', {messages: ['hello']})).rejects.toMatchObject({code: 'authentication', status});
    expect(requests).toHaveLength(2);
    expect(pathname(requests[0]!)).toBe('/v1/zai/signing_secret');
    expect(requests[1]!.method).toBe('POST');
    expect(requests[1]!.headers.get('authorization')).toMatch(/^Bearer ek-/);
    expect(pathname(requests[1]!)).toBe('/v1/zai/sessions/session/messages');
    expect(requests.every(request => !pathname(request).endsWith('/generate'))).toBe(true);
  });

  it('keeps signing-secret and token caches isolated between clients sharing credentials', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async input => pathname(input as Request).endsWith('/signing_secret') ? secret() : ok());
    const first = createZAIClient({baseUrl, auth, fetch});
    const second = createZAIClient({baseUrl, auth, fetch});
    await Promise.all([first.agents.list(), second.agents.list()]);
    await Promise.all([first.agents.list(), second.agents.list()]);
    expect(fetch.mock.calls.filter(([input]) => pathname(input as Request).endsWith('/signing_secret'))).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(6);
  });
});
