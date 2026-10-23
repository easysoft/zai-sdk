import {expect, it, vi} from 'vitest';
import {codingExample} from '../examples/chat-coding.js';
import {createZAIClient, type ZAICodingEvent} from '../src/index.js';

function setup(streamResponse: (request: Request, attempt: number) => Response) {
  const requests: Request[] = [];
  const streams: Request[] = [];
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'ek-test', fetch: async input => {
    const request = input as Request;
    requests.push(request);
    const path = new URL(request.url).pathname;
    if (path.endsWith('/status')) return Response.json({status: 'ready'});
    if (path.endsWith('/agents/agent/sessions')) return Response.json({id: 'session'}, {status: 201});
    if (path.endsWith('/turns')) return Response.json({id: 'turn'}, {status: 202});
    if (path.endsWith('/stream')) {
      streams.push(request);
      return streamResponse(request, streams.length);
    }
    if (path.endsWith('/turns/turn')) return Response.json({id: 'turn', status: 'completed'});
    if (path.endsWith('/cancel')) return Response.json({status: 'canceled'});
    if (request.method === 'DELETE') return Response.json({status: 'archived'});
    throw new Error(`Unexpected request: ${request.method} ${path}`);
  }});
  return {client, requests, streams};
}

function response(events: Partial<ZAICodingEvent>[]) {
  return new Response(events.map(event => {
    const data = {turn_id: 'turn', payload: {}, created_at: '2026-10-22', ...event};
    return `id: ${data.seq}\nevent: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`;
  }).join(''), {headers: {'content-type': 'text/event-stream'}});
}

it('resumes normal EOF without canceling a running turn or duplicating replayed events', async () => {
  const updates = [
    {seq: 1, type: 'session.updated', payload: {turn_id: 'turn', plan_mode: false}},
    {seq: 2, type: 'message.delta', payload: {text: ''}},
    {seq: 3, type: 'turn.completed', turn_id: 'another-turn'},
  ];
  const {client, requests, streams} = setup((request, attempt) => {
    expect(new URL(request.url).searchParams.get('after_seq')).toBe(attempt === 1 ? '0' : '3');
    return response(attempt === 1 ? updates : [updates[2]!, {seq: 4, type: 'turn.completed'}]);
  });
  const result = await codingExample(client, 'agent', 'workspace');
  expect(streams).toHaveLength(2);
  expect(result.events.map(event => event.seq)).toEqual([1, 2, 3, 4]);
  expect(result.events[0]!.payload.plan_mode).toBe(false);
  expect(result.lastSeq).toBe('4');
  expect(result.turn.status).toBe('completed');
  expect(requests.some(request => request.url.endsWith('/cancel'))).toBe(false);
  expect(requests.filter(request => request.method === 'DELETE')).toHaveLength(1);
});

it('honors cancellation between connections and cleans up the unfinished turn', async () => {
  const controller = new AbortController();
  const reason = new Error('Stop observing');
  const {client, requests, streams} = setup(() => response([{seq: 1, type: 'session.updated'}]));
  const pending = codingExample(client, 'agent', 'workspace', controller.signal);
  const rejection = expect(pending).rejects.toBe(reason);
  await vi.waitFor(() => expect(streams).toHaveLength(1));
  controller.abort(reason);
  await rejection;
  expect(streams).toHaveLength(1);
  expect(requests.filter(request => request.url.endsWith('/cancel'))).toHaveLength(1);
  expect(requests.filter(request => request.method === 'DELETE')).toHaveLength(1);
});

it('propagates channel failures and cleans up instead of retrying them', async () => {
  const {client, requests, streams} = setup(() => { throw new Error('Network unavailable'); });
  await expect(codingExample(client, 'agent', 'workspace')).rejects.toMatchObject({code: 'network'});
  expect(streams).toHaveLength(1);
  expect(requests.some(request => request.url.endsWith('/cancel'))).toBe(true);
  expect(requests.some(request => request.method === 'DELETE')).toBe(true);
});
