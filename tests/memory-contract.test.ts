import {expect, it, vi} from 'vitest';
import {createZAIClient, type MemoriesRetryFailedInput} from '../src/index.js';

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

it.each([
  undefined, null, {}, [], {all_failed: false}, {all_failed: 'true'}, {all_failed: true, extra: 1},
  {content_ids: []}, {content_ids: ['']}, {content_ids: [null]}, {content_ids: 'id'},
  {content_ids: ['id'], all_failed: true}, {content_ids: ['id'], extra: 1},
].map(input => [input]))('rejects invalid failed-content selection %j before acquiring credentials', async input => {
  const getToken = vi.fn(() => 'token');
  const fetch = vi.fn(async () => Response.json({success: true, requeued: 1, skipped: 0}, {status: 202}));
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken, fetch});
  await expect(client.memories.retryFailed('collection', input as MemoriesRetryFailedInput)).rejects.toMatchObject({code: 'invalid-input'});
  expect(getToken).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it('validates the serialized retry body once, keeps duplicates and returns acceptance unchanged', async () => {
  const bodies: unknown[] = [];
  const getToken = vi.fn(() => 'token');
  const response = {success: true, requeued: 1, skipped: 2};
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken, fetch: async input => {
    bodies.push(await (input as Request).json());
    return Response.json(response, {status: 202});
  }});
  const contentId = 'a19df031-45d2-4d79-9b77-aed99827ec11';
  const toJSON = vi.fn().mockReturnValueOnce({content_ids: [contentId, contentId]}).mockReturnValue({});
  expect(await client.memories.retryFailed('collection', {toJSON} as unknown as MemoriesRetryFailedInput)).toEqual(response);
  expect(toJSON).toHaveBeenCalledTimes(1);
  expect(await client.memories.retryFailed('collection', {all_failed: true})).toEqual(response);
  expect(bodies).toEqual([{content_ids: [contentId, contentId]}, {all_failed: true}]);
  expect(getToken).toHaveBeenCalledWith(expect.objectContaining({purpose: 'admin'}));
  await expect(client.memories.retryFailed('collection', {all_failed: true}, {tokenType: 'user'})).rejects.toMatchObject({code: 'invalid-input'});
  expect(bodies).toHaveLength(2);
  expect(getToken).toHaveBeenCalledTimes(2);
});
