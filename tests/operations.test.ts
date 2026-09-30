import {describe, expect, it, vi} from 'vitest';
import {createZAIClient} from '../src/client.js';
import {ZAI_OPERATIONS} from '../src/operations.js';
import {loadSpecification, resolveSchema, type Schema} from '../scripts/openapi.js';

const specification = await loadSpecification();
const verbs = new Set(['get', 'post', 'put', 'patch', 'delete']);
const operations = Object.entries(specification.paths).flatMap(([path, item]) =>
  Object.entries(item).filter(([method]) => verbs.has(method)).map(([method, spec]) => ({path, method, spec})),
);
const successCases = operations.flatMap(operation => Object.keys(operation.spec.responses).filter(status => /^2\d\d$/.test(status)).map(status => ({...operation, status: Number(status)})));
// Independently maintained permission expectation: never infer admin privileges from the HTTP verb.
const adminOperations = new Set([
  'get /models', 'post /models', 'get /models/{id}', 'patch /models/{id}', 'delete /models/{id}',
  'get /channels', 'put /channels/{id}', 'get /signing_secret', 'post /signing_secret/generate',
  'post /memories', 'put /memories/{id}', 'delete /memories/{id}',
  'post /memories/{id}/contents', 'put /memories/{id}/contents/{content_id}', 'delete /memories/{id}/contents/{content_id}',
  'post /memories/{id}/contents/batch', 'get /memories/{id}/contents/{content_id}/chunks',
  'get /memories/{id}/contents/{content_id}/jobs', 'get /memories/queue/stats', 'get /coding/runners',
]);

/** Exercise all declared fields independently of the generated method table. */
function fixture(input: Schema = {}, depth = 0): unknown {
  if (depth > 12) return {};
  const schema = resolveSchema(input, specification);
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.enum[0];
  if (schema.allOf) return Object.assign({}, ...schema.allOf.map(part => fixture(part, depth + 1)));
  const alternative = schema.oneOf?.[0] ?? schema.anyOf?.[0];
  if (alternative) return fixture(alternative, depth + 1);
  const type = Array.isArray(schema.type) ? schema.type.find(value => value !== 'null') : schema.type;
  if (type === 'object') return Object.fromEntries(Object.entries(schema.properties ?? {}).map(([name, value]) => [name, fixture(value, depth + 1)]));
  if (type === 'array') return [fixture(schema.items, depth + 1)];
  if (type === 'boolean') return false;
  if (type === 'integer' || type === 'number') return schema.minimum ?? 2;
  if (type === 'string') return '测试 value /?&+#%';
  return {future: 'preserved'};
}

function methodAt(client: unknown, group: string, name: string): (...args: unknown[]) => Promise<unknown> {
  const resource = group.split('.').reduce<unknown>((value, segment) => (value as Record<string, unknown>)[segment], client);
  return (resource as Record<string, (...args: unknown[]) => Promise<unknown>>)[name]!;
}

it('covers exactly 78 paths, 120 operations, 123 public methods and every explicit permission', () => {
  expect(Object.keys(specification.paths)).toHaveLength(78);
  expect(operations).toHaveLength(120);
  expect(ZAI_OPERATIONS).toHaveLength(120);
  const methods = ZAI_OPERATIONS.flatMap(operation => [`${operation.group}.${operation.name}`, ...(operation.streamName ? [`${operation.group}.${operation.streamName}`] : [])]);
  expect(new Set(methods).size).toBe(123);
  expect(ZAI_OPERATIONS.map(operation => `${operation.method} ${operation.path}`).sort()).toEqual(operations.map(operation => `${operation.method} ${operation.path}`).sort());
  expect(ZAI_OPERATIONS.filter(operation => operation.auth === 'admin')).toHaveLength(20);
  expect(ZAI_OPERATIONS.filter(operation => operation.auth === 'user')).toHaveLength(100);
  for (const operation of ZAI_OPERATIONS) {
    expect(operation.auth).toBe(adminOperations.has(`${operation.method} ${operation.path}`) ? 'admin' : 'user');
    expect(operation.source).toMatch(operation.auth === 'admin' ? /^\.\.\/zai-openapi\.json#\/paths\// : /^https:\/\//);
  }
});

for (const mode of ['explicit', 'auto'] as const) describe(`${mode} authentication across every wire contract`, () => {
  it.each(successCases)('$method $path accepts HTTP $status', async ({path, method, spec, status}) => {
    const operation = ZAI_OPERATIONS.find(value => value.path === path && value.method === method)!;
    const parameters = spec.parameters ?? [];
    const pathNames = [...path.matchAll(/\{([^}]+)\}/g)].map(match => match[1]!);
    const queryParameters = parameters.filter(value => value.in === 'query');
    const ids = pathNames.map((name, index) => `${name}-${index} /?#%汉`);
    const query = Object.fromEntries(queryParameters.map(value => [value.name, fixture(value.schema)]));
    const mediaTypes = spec.requestBody?.content;
    const isUpload = !!mediaTypes?.['multipart/form-data'] && !mediaTypes['application/json'];
    const bodySchema = mediaTypes?.['application/json']?.schema ?? mediaTypes?.['multipart/form-data']?.schema;
    const input = mediaTypes ? (isUpload ? {...fixture(bodySchema) as object, file: {blob: new Blob(['wire bytes']), filename: 'input.txt'}} : fixture(bodySchema)) : undefined;
    const responseMediaTypes = spec.responses[status]!.content ?? {};
    const binary = !!responseMediaTypes['application/octet-stream'];
    const stream = !!responseMediaTypes['text/event-stream'] && !responseMediaTypes['application/json'];
    const event = {seq: 2, type: 'turn.completed', turn_id: 'turn', payload: {future: 'kept'}, created_at: '2026-09-29T00:00:00Z'};
    const result = binary ? 'binary result' : fixture(responseMediaTypes['application/json']?.schema);
    const requiresAdmin = adminOperations.has(`${method} ${path}`);
    const getToken = vi.fn((admin: boolean) => admin ? 'ak-contract-token' : 'ek-contract-token');
    let secretFetched = false;
    const fetcher = vi.fn<typeof fetch>(async requestInput => {
      const request = requestInput as Request;
      const url = new URL(request.url);
      if (mode === 'auto' && operation.auth === 'user' && !secretFetched) {
        expect(url.pathname).toBe('/v1/zai/signing_secret');
        expect(request.method).toBe('GET');
        expect(request.headers.get('authorization')).toMatch(/^Bearer ak-/);
        expect(request.headers.get('x-client')).toBe('base');
        secretFetched = true;
        return Response.json({app_id: 'app', signing_secret: 'secret', token_prefix: 'ek-'});
      }
      let expectedPath = `/v1/zai${path}`;
      pathNames.forEach((name, index) => { expectedPath = expectedPath.replace(`{${name}}`, encodeURIComponent(ids[index]!)); });
      expect(request.method).toBe(method.toUpperCase());
      expect(url.pathname).toBe(expectedPath);
      expect(Object.fromEntries(url.searchParams)).toEqual(Object.fromEntries(Object.entries(query).map(([name, value]) => [name, String(value)])));
      if (mode === 'explicit') expect(request.headers.get('authorization')).toBe(requiresAdmin ? 'Bearer ak-contract-token' : 'Bearer ek-contract-token');
      else expect(request.headers.get('authorization')).toMatch(requiresAdmin ? /^Bearer ak-/ : /^Bearer ek-/);
      expect(request.headers.get('x-client')).toBe('base');
      expect(request.headers.get('x-call')).toBe('operation');
      expect(request.headers.get('accept')).toBe(stream ? 'text/event-stream' : binary ? 'application/octet-stream' : 'application/json');
      expect(request.signal.aborted).toBe(false);
      if (isUpload) {
        expect(request.headers.get('content-type')).toContain('multipart/form-data; boundary=');
        const form = await request.formData();
        expect(await (form.get('file') as File).text()).toBe('wire bytes');
        expect((form.get('file') as File).name).toBe('input.txt');
        for (const [key, value] of Object.entries(input as object)) if (key !== 'file') expect(form.get(key)).toBe(value);
        if (path === '/files/extract') expect(form.has('path')).toBe(false);
      } else if (mediaTypes) {
        expect(await request.json()).toEqual(operation.streamName ? {...input as object, stream: false} : input);
        expect(request.headers.get('content-type')).toBe('application/json');
      } else {
        expect(await request.text()).toBe('');
        expect(request.headers.has('content-type')).toBe(false);
      }
      if (stream) return new Response(`: heartbeat\n\nid: 2\nevent: turn.completed\ndata: ${JSON.stringify(event)}\n\n`, {status, headers: {'content-type': 'text/event-stream'}});
      return binary ? new Response(result as string, {status}) : Response.json(result, {status});
    });
    const common = {baseUrl: 'https://zai.test/v1/zai/', fetch: fetcher, headers: {'x-client': 'base'}};
    const client = createZAIClient(mode === 'auto'
      ? {...common, auth: {mode: 'auto', appID: 'app', appKey: 'key', userID: 'user'}}
      : {...common, getToken});
    const args: unknown[] = [...ids];
    if (queryParameters.length) args.push(query);
    if (mediaTypes) args.push(input);
    args.push({signal: new AbortController().signal, headers: {'x-call': 'operation'}});
    const actual = await methodAt(client, operation.group, operation.name)(...args);
    if (binary) {
      expect(actual).toBeInstanceOf(Blob);
      expect(await (actual as Blob).text()).toBe(result);
    } else if (stream) {
      const events = [];
      for await (const value of actual as AsyncIterable<unknown>) events.push(value);
      expect(events).toEqual([{type: 'data', id: '2', event: 'turn.completed', rawData: JSON.stringify(event), data: event}]);
    } else expect(actual).toEqual(result);
    expect(fetcher).toHaveBeenCalledTimes(mode === 'auto' && operation.auth === 'user' ? 2 : 1);
    expect(getToken.mock.calls).toEqual(mode === 'explicit' ? [[requiresAdmin]] : []);
    expect(operation.pathParams).toEqual(pathNames);
    expect(operation.query).toEqual(queryParameters.map(value => value.name));
    expect(operation.hasBody).toBe(!!mediaTypes);
    expect(operation.statuses).toEqual(Object.keys(spec.responses).filter(value => /^2\d\d$/.test(value)).map(Number));
  });
});

describe('resource-specific behavior', () => {
  it('preserves the model management response, including numeric IDs and model_id', async () => {
    const response = {models: [{id: 3, model_id: 'model-1', future: 'kept'}], future: true};
    const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: async () => Response.json(response)});
    expect(await client.settings.models.list()).toEqual(response);
  });

  it('passes model history filters and pagination without fetching extra pages', async () => {
    const response = {sessions: [], page: 2, page_size: 15, total: 42, has_more: true};
    const fetcher = vi.fn<typeof fetch>(async input => {
      expect(Object.fromEntries(new URL((input as Request).url).searchParams)).toEqual({model: 'old/model:1', page: '2', page_size: '15'});
      return Response.json(response);
    });
    const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: fetcher});
    expect(await client.sessions.list({model: 'old/model:1', page: 2, page_size: 15})).toEqual(response);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([{custom_data: {selected: true, nested: {value: 1}}}, {custom_data: null}])('passes repository metadata unchanged via PUT', async body => {
    const fetcher = vi.fn<typeof fetch>(async input => {
      const request = input as Request;
      expect(request.method).toBe('PUT');
      expect(await request.json()).toEqual(body);
      return Response.json({repository: {custom_data: body.custom_data}});
    });
    const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', fetch: fetcher});
    await client.coding.repositories.update('agent', 'workspace', 'repo', body);
  });

  it.each(ZAI_OPERATIONS.filter(operation => operation.streamName))('$group has paired JSON and SSE methods that force the correct stream flag', async operation => {
    const chunk = {choices: [{delta: {tool_calls: [{function: {arguments: '"x"'}}]}}, {delta: {content: 'hi'}}], usage: {tokens: 3}, ok: false};
    let token = 'first';
    const getToken = vi.fn(() => token);
    const fetcher = vi.fn<typeof fetch>(async input => {
      const request = input as Request;
      expect(request.headers.get('authorization')).toBe('Bearer first');
      const body = await request.json() as {stream: boolean};
      expect(request.headers.get('accept')).toBe(body.stream ? 'text/event-stream' : 'application/json');
      return body.stream ? new Response(`event: chunk\ndata: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {headers: {'content-type': 'text/event-stream'}}) : Response.json(chunk);
    });
    const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken, fetch: fetcher});
    const ids = operation.pathParams.map(() => 'id');
    expect(await methodAt(client, operation.group, operation.name)(...ids, {stream: true})).toEqual(chunk);
    const stream = await methodAt(client, operation.group, operation.streamName!)(...ids, {stream: false}) as AsyncIterable<unknown>;
    token = 'renewed';
    const events = [];
    for await (const event of stream) events.push(event);
    expect(events).toEqual([{type: 'data', event: 'chunk', rawData: JSON.stringify(chunk), data: chunk}, {type: 'done'}]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(getToken.mock.calls).toEqual([[false], [false]]);
  });
});
