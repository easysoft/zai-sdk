import {expect, test} from './fixtures.js';
import type {Request} from '@playwright/test';

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
  await page.route('**/v8/models*', async route => {
    request = route.request();
    await route.fulfill({json: [{id: 'browser-model', status: 'active'}]});
  });
  const result = await page.evaluate(async () => {
    const getToken = window.zai.createZAITokenProvider({
      credentials: {appID: 'browser-app', appKey: 'browser-test-key', userID: 'browser-user'},
    });
    const client = window.zai.createZAIClient({baseUrl: '/v8', getToken});
    return client.models.list({all: 'true'});
  });
  expect(result).toEqual({models: [{id: 'browser-model', status: 'active'}]});
  expect(request?.method()).toBe('GET');
  expect(new URL(request!.url()).searchParams.get('all')).toBe('true');
  const authorization = await request!.headerValue('authorization');
  expect(authorization).toMatch(/^Bearer ak-/);
  const payload = JSON.parse(Buffer.from(authorization!.slice('Bearer ak-'.length), 'base64').toString('latin1'));
  expect(payload.app_id).toBe('browser-app');
  expect(payload.user_id).toBe('browser-user');
  expect(payload.hash).toMatch(/^[a-f0-9]{32}$/);
});

test('uploads File and explicitly named Blob using native multipart and downloads binary data', async ({page}) => {
  await page.route('**/v8/sessions/*/files/download*', async route => {
    expect(new URL(route.request().url()).searchParams.get('path')).toBe('nested/file.bin');
    await route.fulfill({contentType: 'application/octet-stream', body: Buffer.from([0, 1, 127, 128, 255])});
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v8', getToken: () => 'browser-token'});
    const nativeFile = await client.sessions.uploadFile('session', {path: 'nested/file.txt', file: new File(['来自 File'], 'native.txt', {type: 'text/plain'})});
    const namedBlob = await client.sessions.uploadFile('session', {
      path: 'nested/blob.txt', file: {blob: new Blob(['来自 Blob'], {type: 'text/plain'}), filename: 'named.txt'},
    });
    const blob = await client.sessions.downloadFile('session', {path: 'nested/file.bin'});
    return {uploads: [nativeFile, namedBlob], isBlob: blob instanceof Blob, bytes: Array.from(new Uint8Array(await blob.arrayBuffer()))};
  });
  expect(result.uploads).toEqual([
    {name: 'native.txt', path: 'nested/file.txt', mime_type: 'text/plain', size: 11, test_content: '来自 File'},
    {name: 'named.txt', path: 'nested/blob.txt', mime_type: 'text/plain', size: 11, test_content: '来自 Blob'},
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
  await page.route('**/v8/sessions/*/messages', async route => {
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
    const client = window.zai.createZAIClient({baseUrl: '/v8', getToken: () => 'browser-token'});
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
  await page.route('**/v8/models', async route => {
    received.push((await route.request().headerValue('authorization'))!);
    await route.fulfill({json: {models: []}});
  });
  const requestTwice = () => page.evaluate(async () => {
    const sdk = window.zai;
    const state = window as Window & {renewalClient?: ReturnType<typeof sdk.createZAIClient>};
    state.renewalClient ??= sdk.createZAIClient({
      baseUrl: '/v8',
      getToken: sdk.createZAITokenProvider({fetchToken: async () => {
        const response = await fetch('/app/token');
        return response.json();
      }}),
    });
    await Promise.all([state.renewalClient.models.list(), state.renewalClient.models.list()]);
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
  await page.route('**/v8/models', () => { requests++; markRequested(); });
  const outcome = page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v8', getToken: () => 'browser-token'});
    window.testAbort = new AbortController();
    try {
      await client.models.list(undefined, {signal: window.testAbort.signal});
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
  await page.route('**/v8/agents/*/sessions', async route => {
    requests++;
    await route.fulfill({status: 401, json: {error: 'expired'}});
  });
  const result = await page.evaluate(async () => {
    const client = window.zai.createZAIClient({baseUrl: '/v8', getToken: () => 'browser-token'});
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
