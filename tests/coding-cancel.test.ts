import {expect, it} from 'vitest';
import {createZAIClient} from '../src/client.js';

it('sends empty JSON when canceling a Coding turn and preserves request options', async () => {
  const controller = new AbortController();
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: async input => {
    const request = input as Request;
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toBe('/v1/zai/coding/sessions/session/turns/turn/cancel');
    expect(request.headers.get('content-type')).toBe('application/json');
    expect(request.headers.get('x-probe')).toBe('cancel');
    expect(await request.json()).toEqual({});
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    return Response.json({status: 'canceled'});
  }});
  await expect(client.coding.turns.cancel('session', 'turn', {signal: controller.signal, headers: {'x-probe': 'cancel'}})).rejects.toMatchObject({code: 'aborted'});
});
