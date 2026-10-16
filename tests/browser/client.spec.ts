import {expect, test} from './fixtures.js';
import type {Request} from '@playwright/test';
import {createHash} from 'node:crypto';

declare global {
  interface Window {
    zai: typeof import('../../src/index.js');
    testAbort: AbortController;
  }
}

test.beforeEach(async ({page}) => {
  await page.goto('/tests/browser/index.html');
  await page.waitForFunction(() => Boolean(window.zai));
});

test('imports the ESM build and sends a signed authenticated GET with query parameters', async ({page}) => {
  let request: Request | undefined;
  await page.route('**/v1/zai/sessions*', async route => {
    request = route.request();
    await route.fulfill({json: {sessions: [], page: 2}});
  });
  const result = await page.evaluate(async () => {
    const getToken = window.zai.createZAITokenProvider({
      credentials: {appID: 'browser-app', appKey: 'browser-test-key', userID: '用户😀'},
    });
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken});
    return client.sessions.list({page: 2});
  });
  expect(result).toEqual({sessions: [], page: 2});
  expect(request?.method()).toBe('GET');
  expect(new URL(request!.url()).searchParams.get('page')).toBe('2');
  const authorization = await request!.headerValue('authorization');
  expect(authorization).toMatch(/^Bearer ak-/);
  const payload = JSON.parse(Buffer.from(authorization!.slice('Bearer ak-'.length), 'base64').toString('utf8'));
  expect(payload.app_id).toBe('browser-app');
  expect(payload.user_id).toBe('用户😀');
  expect(payload.hash).toBe(createHash('md5').update('browser-test-key' + 'browser-app' + '用户😀' + payload.expired_time, 'utf8').digest('hex'));
  expect(payload.hash).toMatch(/^[a-f0-9]{32}$/);
});

test('diagnoses a relative API root and cleans up an optional chat probe through native fetch', async ({page}) => {
  const methods: string[] = [];
  await page.route('**/v1/zai/**', async route => {
    const request = route.request();
    methods.push(request.method());
    expect(await request.headerValue('authorization')).toBe('Bearer diagnostic-token');
    const path = new URL(request.url()).pathname;
    if (path === '/v1/zai/agents') {
      await route.fulfill({json: {agents: [{id: 'agent', type: 'custom', status: 'active', is_default: true}]}});

    } else if (path === '/v1/zai/agents/agent/sessions') {
      await route.fulfill({status: 201, json: {session: {id: 'probe'}}});
    } else if (path === '/v1/zai/sessions/probe/messages') {
      await route.fulfill({json: {content: 'OK'}});
    } else if (request.method() === 'DELETE' && path === '/v1/zai/sessions/probe') {
      await route.fulfill({json: {message: 'Deleted'}});
    } else throw new Error(`Unexpected diagnostic request: ${path}`);
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'diagnostic-token'});
    const basic = await client.doctor();
    const progress: string[] = [];
    const full = await client.doctor({chat: true, onChange: detail => progress.push(detail.type)});
    return {basic, full, progress};
  });
  expect(result.basic).toMatchObject({pass: true, agentId: 'agent'});
  expect(result.basic.sessionId).toBeUndefined();
  expect(result.full).toMatchObject({pass: true, sessionId: 'probe'});
  expect(result.progress).toEqual(['config', 'httpProtocol', 'server', 'agents', 'chat', 'cleanup']);
  expect(methods).toEqual(['GET', 'GET', 'POST', 'POST', 'DELETE']);
});

test('uploads File and explicitly named Blob using native multipart and downloads binary data', async ({page}) => {
  await page.route('**/v1/zai/sessions/*/files/download*', async route => {
    expect(new URL(route.request().url()).searchParams.get('path')).toBe('nested/file.bin');
    await route.fulfill({contentType: 'application/octet-stream', body: Buffer.from([0, 1, 127, 128, 255])});
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'browser-token'});
    const nativeFile = await client.sessions.uploadFile('session', {path: 'nested/file.txt', file: new File(['来自 File'], 'native.txt', {type: 'text/plain'})});
    const namedBlob = await client.sessions.uploadFile('session', {
      path: 'nested/blob.txt', file: {blob: new Blob(['来自 Blob'], {type: 'text/plain'}), filename: 'named.txt'},
    });
    const attachment = await client.sessions.uploadFile('session', {file: new File(['附件'], 'attachment.txt', {type: 'text/plain'})});
    const blob = await client.sessions.downloadFile('session', {path: 'nested/file.bin'});
    return {uploads: [nativeFile, namedBlob, attachment], isBlob: blob instanceof Blob, bytes: Array.from(new Uint8Array(await blob.arrayBuffer()))};
  });
  expect(result.uploads).toEqual([
    {name: 'native.txt', path: 'nested/file.txt', mime_type: 'text/plain', size: 11, test_content: '来自 File'},
    {name: 'named.txt', path: 'nested/blob.txt', mime_type: 'text/plain', size: 11, test_content: '来自 Blob'},
    {name: 'attachment.txt', id: 'attachment-id', status: 'ready', mime_type: 'text/plain', size: 6, test_content: '附件'},
  ]);
  expect(result.isBlob).toBe(true);
  expect(result.bytes).toEqual([0, 1, 127, 128, 255]);
});

test('sends JSON mode and preserves SSE event names, tool calls, usage and extra fields', async ({page}) => {
  const bodies: Record<string, unknown>[] = [];
  const chunk = {
    choices: [{index: 0, delta: {content: '你好', tool_calls: [{index: 0, function: {name: 'lookup', arguments: '{}'}}]}}],
    usage: {total_tokens: 3}, future_field: {kept: true},
  };
  await page.route('**/v1/zai/sessions/*/messages', async route => {
    const body = route.request().postDataJSON();
    bodies.push(body);
    if (body.stream) {
      await route.fulfill({
        contentType: 'text/event-stream; charset=utf-8',
        body: `event: completion\nid: browser-event\ndata: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`,
      });
    } else {
      await route.fulfill({json: {content: 'OK', model: 'browser-model', finish_reason: 'stop', usage: {total_tokens: 1}}});
    }
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'browser-token'});
    const input = {content: [{type: 'input_text' as const, text: 'hello'}]};
    const message = await client.messages.send('session', input);
    const events = [];
    for await (const event of await client.messages.stream('session', input)) events.push(event);
    return {message, events};
  });
  expect(bodies.map(body => body.stream)).toEqual([false, true]);
  expect(result.message.content).toBe('OK');
  expect(result.events).toEqual([
    {type: 'data', event: 'completion', id: 'browser-event', rawData: JSON.stringify(chunk), data: chunk},
    {type: 'done'},
  ]);
});

test('renews backend tokens at the boundary and shares renewal across real browser requests', async ({page}) => {
  const epoch = 1_893_456_000;
  await page.clock.install({time: new Date(epoch * 1000)});
  let tokensIssued = 0;
  const received: string[] = [];
  await page.route('**/app/token', async route => {
    tokensIssued++;
    await route.fulfill({json: {token: `backend-${tokensIssued}`, expiresAt: epoch + tokensIssued * 100}});
  });
  await page.route('**/v1/zai/agents', async route => {
    received.push((await route.request().headerValue('authorization'))!);
    await route.fulfill({json: {agents: []}});
  });
  const requestTwice = () => page.evaluate(async () => {
    const sdk = window.zai;
    const state = window as Window & {renewalClient?: ReturnType<typeof sdk.createZAIClient>};
    state.renewalClient ??= sdk.createZAIClient({
      baseUrl: '/v1/zai',
      getToken: sdk.createZAITokenProvider({fetchToken: async () => {
        const response = await fetch('/app/token');
        return response.json();
      }}),
    });
    await Promise.all([state.renewalClient.agents.list(), state.renewalClient.agents.list()]);
  });
  await requestTwice();
  expect(tokensIssued).toBe(1);
  await page.clock.fastForward(40_000);
  await requestTwice();
  expect(tokensIssued).toBe(2);
  expect(received).toEqual(['Bearer backend-1', 'Bearer backend-1', 'Bearer backend-2', 'Bearer backend-2']);
});

test('aborts an in-flight native fetch and classifies it without replay', async ({page}) => {
  let markRequested!: () => void;
  const requested = new Promise<void>(resolve => { markRequested = resolve; });
  let requests = 0;
  await page.route('**/v1/zai/agents', () => { requests++; markRequested(); });
  const outcome = page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'browser-token'});
    window.testAbort = new AbortController();
    try {
      await client.agents.list({signal: window.testAbort.signal});
      return 'unexpected-success';
    } catch (error) {
      return error instanceof window.zai.ZAIClientError ? error.code : 'unexpected-error';
    }
  });
  await requested;
  await page.evaluate(() => window.testAbort.abort());
  expect(await outcome).toBe('aborted');
  expect(requests).toBe(1);
});

test('returns 401 as authentication error without automatically replaying POST', async ({page}) => {
  let requests = 0;
  await page.route('**/v1/zai/agents/*/sessions', async route => {
    requests++;
    await route.fulfill({status: 401, json: {error: 'expired'}});
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'browser-token'});
    try {
      await client.sessions.create('agent', {title: 'browser test'});
      return null;
    } catch (error) {
      return error instanceof window.zai.ZAIClientError ? {code: error.code, status: error.status} : null;
    }
  });
  expect(result).toEqual({code: 'authentication', status: 401});
  expect(requests).toBe(1);
});

test('selects ak/ek and shares signing-secret acquisition in every browser', async ({page}) => {
  const received: {path: string; prefix: string; payload: {user_id: string; user_name: string; hash: string; expired_time: number}}[] = [];
  await page.route('**/v1/zai/**', async route => {
    const request = route.request();
    const token = (await request.headerValue('authorization'))!.slice('Bearer '.length);
    const path = new URL(request.url()).pathname;
    received.push({path, prefix: token.slice(0, 3), payload: JSON.parse(Buffer.from(token.slice(3), 'base64').toString('utf8'))});
    if (path.endsWith('/signing_secret')) await route.fulfill({json: {app_id: 'browser-app', signing_secret: '用户-secret', token_prefix: 'ek-'}});
    else if (path.endsWith('/models')) await route.fulfill({json: {models: []}});
    else await route.fulfill({json: {agents: []}});
  });
  await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', auth: {mode: 'auto', appID: 'browser-app', appKey: 'admin-key', userID: '用户😀', userName: '昵称🌟'}});
    await Promise.all([client.agents.list(), client.agents.list(), client.settings.models.list()]);
    await client.settings.models.list({tokenType: 'admin'});
    await client.agents.list();
  });
  expect(received.filter(entry => entry.path.endsWith('/signing_secret'))).toHaveLength(1);
  expect(received.filter(entry => entry.path.endsWith('/models')).map(entry => entry.prefix)).toEqual(['ek-', 'ak-']);
  for (const entry of received) {
    const admin = entry.path.endsWith('/signing_secret') || (entry.path.endsWith('/models') && entry.prefix === 'ak-');
    expect(entry.prefix).toBe(admin ? 'ak-' : 'ek-');
    expect(entry.payload.user_id).toBe('用户😀');
    expect(entry.payload.user_name).toBe('昵称🌟');
    expect(entry.payload.hash).toBe(createHash('md5').update((admin ? 'admin-key' : '用户-secret') + 'browser-app' + '用户😀' + entry.payload.expired_time).digest('hex'));
  }
});

test('passes the required permission to an async getToken before each native request', async ({page}) => {
  const received: {path: string; token: string | null}[] = [];
  await page.route('**/v1/zai/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    received.push({path, token: await request.headerValue('authorization')});
    await route.fulfill({status: path.endsWith('/memories') ? 403 : 200, json: {}});
  });
  const result = await page.evaluate(async () => {
    const permissions: boolean[] = [];
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: async admin => {
      permissions.push(admin);
      return admin ? 'ak-backend' : 'ek-backend';
    }});
    await client.agents.list();
    await client.settings.models.list();
    await client.settings.models.list({tokenType: 'admin'});
    await client.messages.send('session', {content: [{type: 'input_text', text: 'hello'}]});
    try {
      await client.memories.create({name: 'test'});
      throw new Error('Expected permission denial');
    } catch (error) {
      if (!(error instanceof window.zai.ZAIClientError)) throw error;
      return {permissions, code: error.code, status: error.status};
    }
  });
  expect(result).toEqual({permissions: [false, false, true, false, true], code: 'authentication', status: 403});
  expect(received).toEqual([
    {path: '/v1/zai/agents', token: 'Bearer ek-backend'},
    {path: '/v1/zai/models', token: 'Bearer ek-backend'},
    {path: '/v1/zai/models', token: 'Bearer ak-backend'},
    {path: '/v1/zai/sessions/session/messages', token: 'Bearer ek-backend'},
    {path: '/v1/zai/memories', token: 'Bearer ak-backend'},
  ]);
});

test('extracts a file without a path through real multipart HTTP', async ({page}) => {
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'ek-browser'});
    return client.files.extract({file: new File(['文档😀'], 'document.txt', {type: 'text/plain'})});
  });
  expect(result).toEqual({content: '文档😀', metadata: {filename: 'document.txt', hasPath: false}});
});

test('reads a persistent native Coding stream across turns and cancels without DONE', async ({page}) => {
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'ek-browser'});
    const stream = await client.coding.events.stream('browser', {after_seq: '40'});
    const first = await stream.next();
    const second = await stream.next();
    const third = await stream.next();
    const fourth = await stream.next();
    await stream.return?.();
    return {events: [first.value, second.value, third.value, fourth.value], closed: await stream.next()};
  });
  expect(result.events.map(event => event.data.seq)).toEqual([41, 42, 43, 44]);
  expect(result.events.map(event => event.event)).toEqual(['error', 'turn.failed', 'turn.started', 'message.delta']);
  expect(result.closed.done).toBe(true);
});

test('uploads raw Blob bytes and consumes native Runner status snapshots to EOF', async ({page}) => {
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: () => 'ek-browser'});
    const file = await client.coding.sessions.uploadFile('browser', {name: '图片.txt'}, new Blob(['你好😀'], {type: 'text/plain'}));
    const empty = await client.coding.sessions.uploadFile('browser', {name: 'empty'}, new Blob());
    const events = [];
    for await (const event of await client.coding.agents.streamStatus('browser')) events.push(event);
    return {file, empty, events};
  });
  expect(result.file).toMatchObject({name: '图片.txt', size: 10, test_content: '你好😀', request_type: 'application/octet-stream'});
  expect(result.empty).toMatchObject({name: 'empty', size: 0, test_content: '', request_type: 'application/octet-stream'});
  expect(result.events.map(event => event.data)).toEqual([
    {agent_id: 'browser', status: 'starting', reason: null}, {agent_id: 'browser', status: 'ready', reason: null},
  ]);
  expect(result.events.every(event => event.event === 'runner.status')).toBe(true);
});

test('generates and reuses idempotency keys and downloads Coding attachments with user tokens', async ({page}) => {
  const keys: string[] = [];
  await page.route('**/v1/zai/coding/agents/agent/workspaces', async route => {
    keys.push((await route.request().headerValue('idempotency-key'))!);
    expect(await route.request().headerValue('authorization')).toBe('Bearer ek-browser');
    await route.fulfill({status: 201, json: {id: 'workspace'}});
  });
  await page.route('**/v1/zai/coding/sessions/session/files/download*', async route => {
    expect(await route.request().headerValue('authorization')).toBe('Bearer ek-browser');
    expect(new URL(route.request().url()).searchParams.get('file_id')).toBe('attachment');
    await route.fulfill({contentType: 'application/octet-stream', body: Buffer.from([0, 128, 255])});
  });
  const bytes = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v1/zai', getToken: admin => admin ? 'ak-browser' : 'ek-browser'});
    await client.coding.workspaces.create('agent', {name: 'first'});
    await client.coding.workspaces.create('agent', {name: 'second'});
    await client.coding.workspaces.create('agent', {name: 'retry'}, {idempotencyKey: 'workspace-retry', headers: {'Idempotency-Key': 'ignored'}});
    await client.coding.workspaces.create('agent', {name: 'retry'}, {idempotencyKey: 'workspace-retry'});
    const blob = await client.coding.sessions.downloadFile('session', {file_id: 'attachment'});
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  expect(keys.slice(0, 2).every(key => /^[a-f0-9]{32}$/.test(key))).toBe(true);
  expect(keys[0]).not.toBe(keys[1]);
  expect(keys.slice(2)).toEqual(['workspace-retry', 'workspace-retry']);
  expect(bytes).toEqual([0, 128, 255]);
});
