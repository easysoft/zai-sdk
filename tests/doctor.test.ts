import {afterEach, describe, expect, it, vi} from 'vitest';
import {createZAIClient, type CreateZAIClientOptions, type ZAIDoctorDetail, type ZAIDoctorOptions} from '../src/index.js';

const custom = {id: 'custom', type: 'custom', status: 'active', is_default: false};
const defaultAgent = {...custom, id: 'default', is_default: true};

function setup(
  respond?: (request: Request) => Response | undefined | Promise<Response | undefined>,
  options: Partial<Extract<CreateZAIClientOptions, {getToken: unknown}>> = {},
) {
  const requests: Request[] = [];
  const getToken = vi.fn(() => 'doctor-token');
  const fetcher = vi.fn<typeof fetch>(async input => {
    const request = input as Request;
    requests.push(request);
    const response = await respond?.(request);
    if (response) return response;
    const path = new URL(request.url).pathname;
    if (path === '/v1/zai/agents') return Response.json({agents: [custom, defaultAgent]});
    if (path.endsWith('/sessions')) return Response.json({session: {id: 'temporary'}}, {status: 201});
    if (path.endsWith('/messages')) return Response.json({content: 'OK', execution_summary: {status: 'completed'}});
    if (request.method === 'DELETE') return Response.json({message: 'Deleted'});
    throw new Error(`Unexpected request: ${request.method} ${path}`);
  });
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken, ...options, fetch: fetcher});
  return {client, requests, getToken, fetcher};
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('connection and capability diagnostics', () => {
  it('reads fresh authenticated lists without creating a session by default', async () => {
    const {client, requests, getToken} = setup(undefined, {headers: {'x-shared': 'default', 'x-default': 'kept'}});
    const details: ZAIDoctorDetail[] = [];
    const result = await client.doctor({headers: {'x-shared': 'override'}, onChange: detail => details.push(detail)});
    expect(result).toMatchObject({pass: true, summary: 'All requested checks passed.', agentId: 'default'});
    expect(result.sessionId).toBeUndefined();
    expect(details).toEqual(result.details);
    expect(details.map(detail => detail.type)).toEqual(['config', 'httpProtocol', 'server', 'agents']);
    expect(requests.map(request => [request.method, new URL(request.url).pathname])).toEqual([
      ['GET', '/v1/zai/agents'],
    ]);
    for (const request of requests) {
      expect(request.headers.get('authorization')).toBe('Bearer doctor-token');
      expect(request.headers.get('x-shared')).toBe('override');
      expect(request.headers.get('x-default')).toBe('kept');
      expect(new URL(request.url).search).toBe('');
    }
    await client.doctor();
    expect(getToken).toHaveBeenCalledTimes(2);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 2_147_483_648])('reports invalid timeout %s without network access', async timeoutMs => {
    const {client, fetcher, getToken} = setup();
    const result = await client.doctor({timeoutMs});
    expect(result).toMatchObject({pass: false, details: [{type: 'config', pass: false}]});
    expect(fetcher).not.toHaveBeenCalled();
    expect(getToken).not.toHaveBeenCalled();
  });

  it.each([{chat: 'yes'}, {agentId: ''}, {agentId: '.'}, {model: '..'}, {model: '  '}])('reports invalid diagnostic options %j', async options => {
    const {client, fetcher} = setup();
    expect((await client.doctor(options as ZAIDoctorOptions)).pass).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('resolves a relative browser API root when constructing the client', async () => {
    vi.stubGlobal('location', {href: 'https://browser.test/app', protocol: 'https:'});
    const {client, requests} = setup(undefined, {baseUrl: '/v1/zai'});
    expect((await client.doctor()).pass).toBe(true);
    expect(requests[0]!.url).toBe('https://browser.test/v1/zai/agents');
  });

  it.each(['http://zai.test/v1/zai', 'http://localhost.evil.test/v1/zai'])('reports browser mixed content for %s before authentication', async baseUrl => {
    vi.stubGlobal('location', {href: 'https://browser.test/app', protocol: 'https:'});
    const {client, getToken} = setup(undefined, {baseUrl});
    const result = await client.doctor();
    expect(result).toMatchObject({pass: false});
    expect(result.details.at(-1)).toMatchObject({type: 'httpProtocol', pass: false});
    expect(getToken).not.toHaveBeenCalled();
  });

  it.each(['http://localhost/v1/zai', 'http://api.localhost/v1/zai', 'http://127.0.0.1/v1/zai', 'http://[::1]/v1/zai'])('permits browser loopback API %s', async baseUrl => {
    vi.stubGlobal('location', {href: 'https://browser.test/app', protocol: 'https:'});
    expect((await setup(undefined, {baseUrl}).client.doctor()).pass).toBe(true);
  });

  it('allows an HTTP page to use an HTTPS API and a Node client to use HTTP', async () => {
    vi.stubGlobal('location', {href: 'http://browser.test/app', protocol: 'http:'});
    expect((await setup().client.doctor()).pass).toBe(true);
    vi.unstubAllGlobals();
    expect((await setup(undefined, {baseUrl: 'http://zai.test/v1/zai'}).client.doctor()).pass).toBe(true);
  });

  it.each([401, 403, 503])('preserves HTTP failure %s without replaying or probing further', async status => {
    const {client, fetcher} = setup(() => Response.json({error: 'Denied'}, {status}));
    const result = await client.doctor({chat: true});
    expect(result.pass).toBe(false);
    expect(result.details.at(-1)).toMatchObject({type: 'server', error: {code: status === 503 ? 'http' : 'authentication', status}});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('reports network and token-provider failures', async () => {
    const offline = setup(() => { throw new TypeError('Offline'); });
    expect((await offline.client.doctor()).details.at(-1)).toMatchObject({type: 'server', pass: false, error: {code: 'network'}});
    const noToken = setup(undefined, {getToken: () => ''});
    expect((await noToken.client.doctor()).details.at(-1)).toMatchObject({type: 'server', pass: false, error: {code: 'authentication'}});
    expect(noToken.fetcher).not.toHaveBeenCalled();
  });

  it.each([null, {}, {agents: null}, {agents: [null]}, {agents: [{...custom, id: '..'}]}, {agents: [{...custom, type: 'unknown'}]}, {agents: [{...custom, status: 'unknown'}]}])('rejects malformed agent response %j', async response => {
    const {client, fetcher} = setup(() => Response.json(response));
    expect((await client.doctor()).details.at(-1)).toMatchObject({type: 'server', pass: false, error: {code: 'invalid-response'}});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not query administrator models and passes the model name only to an enabled probe', async () => {
    const {client, requests} = setup(request => {
      if (request.url.endsWith('/models')) throw new Error('Must not access admin models');
      return undefined;
    });
    expect((await client.doctor({model: 'unlisted-model'})).pass).toBe(true);
    expect(requests).toHaveLength(1);
    const full = await client.doctor({chat: true, model: 'unlisted-model'});
    expect(full.pass).toBe(true);
    expect(await requests.find(request => request.method === 'POST')!.json()).toMatchObject({model: 'unlisted-model'});
  });

  it('does not fall back when a requested Agent is unavailable', async () => {
    const {client, requests} = setup();
    expect((await client.doctor({chat: true, agentId: 'missing'})).details.at(-1)).toMatchObject({type: 'agents', pass: false});
    expect(requests.every(request => request.method === 'GET')).toBe(true);
  });

  it('selects the first active custom Agent when no eligible default exists', async () => {
    const {client} = setup(request => new URL(request.url).pathname === '/v1/zai/agents'
      ? Response.json({agents: [{...defaultAgent, type: 'runner'}, {...custom, status: 'disabled'}, {...custom, id: 'eligible'}]}) : undefined);
    expect(await client.doctor()).toMatchObject({pass: true, agentId: 'eligible'});
  });

  it.each([[], [{...custom, type: 'runner'}], [{...custom, type: 'system'}], [{...custom, status: 'disabled'}]].map(agents => ({agents})))('requires an active custom Agent: %j', async ({agents}) => {
    const {client, requests} = setup(request => new URL(request.url).pathname === '/v1/zai/agents' ? Response.json({agents}) : undefined);
    const result = await client.doctor({chat: true});
    expect(result.pass).toBe(false);
    expect(result.details.at(-1)).toMatchObject({type: 'agents', pass: false});
    expect(requests.every(request => request.method === 'GET')).toBe(true);
  });

  it('bounds token acquisition by the diagnostic timeout and supports pre-cancellation', async () => {
    const {client, fetcher} = setup(undefined, {getToken: () => new Promise<string>(() => {})});
    const result = await client.doctor({timeoutMs: 10});
    expect(result.details.at(-1)).toMatchObject({type: 'server', pass: false, error: {code: 'aborted'}});
    const cancelled = setup();
    expect((await cancelled.client.doctor({signal: AbortSignal.abort()})).details.at(-1)).toMatchObject({type: 'server', pass: false, error: {code: 'aborted'}});
    expect(cancelled.getToken).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('temporary conversation probe', () => {
  it('uses the selected Agent and model, limits the probe, reports progress, and deletes only its own session', async () => {
    const {client, requests} = setup();
    const progress: string[] = [];
    const result = await client.doctor({chat: true, agentId: 'custom', model: 'model', onChange: detail => progress.push(detail.type)});
    expect(result).toMatchObject({pass: true, agentId: 'custom', sessionId: 'temporary'});
    expect(progress).toEqual(['config', 'httpProtocol', 'server', 'agents', 'chat', 'cleanup']);
    expect(new URL(requests[1]!.url).pathname).toBe('/v1/zai/agents/custom/sessions');
    expect(await requests[1]!.json()).toMatchObject({model: 'model', skills: [], reference_settings: {memories: {collections: []}}, category: 'zai-sdk-doctor'});
    expect(await requests[2]!.json()).toMatchObject({stream: false, tools: [], tool_execution_mode: 'schema-only', content: [{type: 'input_text', text: expect.any(String)}]});
    expect(requests[3]!.method).toBe('DELETE');
    expect(new URL(requests[3]!.url).pathname).toBe('/v1/zai/sessions/temporary');
  });

  it.each([null, {}, {session: {id: ''}}, {session: {id: '..'}}])('does not send or delete with an invalid session response %j', async response => {
    const {client, requests} = setup(request => request.method === 'POST' ? Response.json(response, {status: 201}) : undefined);
    const result = await client.doctor({chat: true});
    expect(result.pass).toBe(false);
    expect(result.details.at(-1)).toMatchObject({type: 'chat', pass: false, error: {code: 'invalid-response'}});
    expect(requests).toHaveLength(2);
    expect(result.sessionId).toBeUndefined();
  });

  it.each([null, {}, {content: ''}, {content: '  '}, {content: null}, {content: 'Failure', execution_summary: {status: 'failed'}}])('fails empty or unsuccessful reply %j and still cleans up', async response => {
    const {client} = setup(request => request.url.endsWith('/messages') ? Response.json(response) : undefined);
    const result = await client.doctor({chat: true});
    expect(result.pass).toBe(false);
    expect(result.details.slice(-2)).toMatchObject([{type: 'chat', pass: false, error: {code: 'invalid-response'}}, {type: 'cleanup', pass: true}]);
  });

  it('accepts a non-empty reply without the optional execution summary', async () => {
    const {client} = setup(request => request.url.endsWith('/messages') ? Response.json({content: 'Hello'}) : undefined);
    expect((await client.doctor({chat: true})).pass).toBe(true);
  });

  it('cleans up after a failed message and retains both message and cleanup errors', async () => {
    const {client} = setup(request => request.url.endsWith('/messages') || request.method === 'DELETE'
      ? Response.json({error: 'Unavailable'}, {status: 503}) : undefined);
    const result = await client.doctor({chat: true});
    expect(result).toMatchObject({pass: false, sessionId: 'temporary'});
    expect(result.details.slice(-2)).toMatchObject([
      {type: 'chat', pass: false, error: {code: 'http', status: 503}},
      {type: 'cleanup', pass: false, error: {code: 'http', status: 503}},
    ]);
    expect(result.details.at(-1)?.message).toContain('temporary');
  });

  it.each([null, {}, {message: 'Not deleted', ok: false}])('fails diagnostics when cleanup has an invalid business response %j', async response => {
    const {client} = setup(request => request.method === 'DELETE' ? Response.json(response) : undefined);
    const result = await client.doctor({chat: true});
    expect(result.pass).toBe(false);
    expect(result.details.slice(-2)).toMatchObject([{type: 'chat', pass: true}, {type: 'cleanup', pass: false, error: {code: 'invalid-response'}}]);
  });

  it('uses a fresh cleanup signal after the chat is cancelled', async () => {
    const controller = new AbortController();
    const {client, requests} = setup(request => {
      if (request.url.endsWith('/messages')) controller.abort();
      return undefined;
    });
    const result = await client.doctor({chat: true, signal: controller.signal, headers: {'x-trace': 'diagnostic'}});
    expect(result.details.slice(-2)).toMatchObject([{type: 'chat', pass: false, error: {code: 'aborted'}}, {type: 'cleanup', pass: true}]);
    const cleanup = requests.at(-1)!;
    expect(cleanup.method).toBe('DELETE');
    expect(cleanup.signal.aborted).toBe(false);
    expect(cleanup.headers.get('x-trace')).toBe('diagnostic');
  });

  it('cleans up before propagating a progress callback exception', async () => {
    const {client, requests} = setup();
    const error = new Error('UI callback failed');
    await expect(client.doctor({chat: true, onChange(detail) { if (detail.type === 'chat') throw error; }})).rejects.toBe(error);
    expect(requests.at(-1)?.method).toBe('DELETE');
  });
});
