import {expect, it} from 'vitest';
import {createZAIClient} from '../src/index.js';

it.each([undefined, 'application/json', 'text/plain'])('returns undefined for an empty memory content response (%s)', async contentType => {
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: async () =>
    new Response(null, {status: 200, headers: contentType ? {'content-type': contentType} : {}}),
  });
  expect(await client.memories.getContent('collection', 'missing')).toBeUndefined();
  await expect(client.memories.get('collection')).rejects.toMatchObject({code: 'invalid-response', status: 200});
});

it.each([
  [' ', 'application/json'], ['{invalid', 'application/json'], ['{"id":"content"}', 'text/plain'],
])('still rejects a malformed or non-JSON memory response (%s, %s)', async (body, contentType) => {
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: async () =>
    new Response(body, {status: 200, headers: {'content-type': contentType}}),
  });
  await expect(client.memories.getContent('collection', 'content')).rejects.toMatchObject({code: 'invalid-response', status: 200});
});

it('preserves nonempty memory content and never treats HTTP failures as missing content', async () => {
  const content = {id: 'content', content: 'Text', external_user_id: null, future: true};
  const responses = [Response.json(content), new Response(null, {status: 404}), new Response(null, {status: 204})];
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: async () => responses.shift()!});
  expect(await client.memories.getContent('collection', 'content')).toEqual(content);
  await expect(client.memories.getContent('collection', 'content')).rejects.toMatchObject({code: 'http', status: 404});
  await expect(client.memories.getContent('collection', 'content')).rejects.toMatchObject({code: 'invalid-response', status: 204});
});
