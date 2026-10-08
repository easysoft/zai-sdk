import {createHash} from 'node:crypto';
import * as sdk from '../../src/index.js';
import {expect, test} from './fixtures.js';

declare global {
  interface Window {
    ZAI: typeof import('../../src/index.js');
  }
}

test('loads one classic script with all exports, signed requests and SSE dependencies', async ({page}) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  const authorization: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname);
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/umd-test', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><meta charset="utf-8"><script src="/dist/zai.js"></script>',
  }));
  await page.route('**/v1/zai/agents', async route => {
    authorization.push((await route.request().headerValue('authorization'))!);
    await route.fulfill({json: {agents: []}});
  });
  await page.route('**/v1/zai/sessions/session/messages', async route => {
    expect(route.request().postDataJSON()).toMatchObject({content: [{type: 'input_text', text: 'hello'}], stream: true});
    authorization.push((await route.request().headerValue('authorization'))!);
    await route.fulfill({contentType: 'text/event-stream', body: 'event: completion\nid: umd\ndata: {"content":"你好"}\n\ndata: [DONE]\n\n'});
  });
  await page.goto('/umd-test');
  const result = await page.evaluate(async () => {
    const client = window.ZAI.createZAIClient({
      baseUrl: '/v1/zai',
      getToken: window.ZAI.createZAITokenProvider({credentials: {appID: 'umd', appKey: 'fixture', userID: '用户😀'}}),
    });
    const agents = await client.agents.list();
    const events = [];
    for await (const event of await client.messages.stream('session', {content: [{type: 'input_text', text: 'hello'}]})) events.push(event);
    return {exports: Object.keys(window.ZAI).sort(), agents, events, error: new window.ZAI.ZAIClientError('http', 'fixture').code};
  });
  expect(result.exports).toEqual(Object.keys(sdk).sort());
  expect(result.agents).toEqual({agents: []});
  expect(result.events).toEqual([
    {type: 'data', event: 'completion', id: 'umd', rawData: '{"content":"你好"}', data: {content: '你好'}},
    {type: 'done'},
  ]);
  expect(result.error).toBe('http');
  expect(authorization).toHaveLength(2);
  expect(authorization[0]).toMatch(/^Bearer ak-/);
  expect(authorization[1]).toBe(authorization[0]);
  const payload = JSON.parse(Buffer.from(authorization[0]!.slice('Bearer ak-'.length), 'base64').toString('utf8'));
  expect(payload).toMatchObject({app_id: 'umd', user_id: '用户😀'});
  expect(payload.hash).toBe(createHash('md5').update(`fixtureumd用户😀${payload.expired_time}`, 'utf8').digest('hex'));
  expect(scripts).toEqual(['/dist/zai.js']);
  expect(errors).toEqual([]);
});
