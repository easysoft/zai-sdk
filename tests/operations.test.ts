import {readFileSync} from 'node:fs';
import {describe, expect, it, vi} from 'vitest';
import {createZAIClient} from '../src/client.js';
import {ZAI_OPERATIONS} from '../src/operations.js';

interface Schema {
  type?: string | string[];
  properties?: Record<string, Schema>;
  items?: Schema;
  enum?: unknown[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  example?: unknown;
  default?: unknown;
  minimum?: number;
}
interface Parameter {name: string; in: string; schema?: Schema}
interface Operation {
  parameters?: Parameter[];
  requestBody?: {content: Record<string, {schema?: Schema}>};
  responses: Record<string, {content?: Record<string, {schema?: Schema}>}>;
}
const specification = JSON.parse(readFileSync(new URL('../zai-openapi.json', import.meta.url), 'utf8')) as {
  paths: Record<string, Record<string, Operation>>;
};
const verbs = new Set(['get', 'post', 'put', 'patch', 'delete']);
const operations = Object.entries(specification.paths).flatMap(([path, item]) =>
  Object.entries(item).filter(([method]) => verbs.has(method)).map(([method, spec]) => ({path, method, spec})),
);

/** Independent fixtures exercise all declared fields, rather than copying the generated map. */
function fixture(schema: Schema = {}, depth = 0): unknown {
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.enum[0];
  const alternative = schema.oneOf?.[0] ?? schema.anyOf?.[0];
  if (alternative) return fixture(alternative, depth + 1);
  const type = Array.isArray(schema.type) ? schema.type.find(value => value !== 'null') : schema.type;
  if (type === 'object') return depth > 12 ? {} : Object.fromEntries(
    Object.entries(schema.properties ?? {}).map(([name, value]) => [name, fixture(value, depth + 1)]),
  );
  if (type === 'array') return [fixture(schema.items, depth + 1)];
  if (type === 'boolean') return false;
  if (type === 'integer' || type === 'number') return schema.minimum ?? 2;
  if (type === 'string') return '测试 value /?&+#%';
  return {future: 'preserved'};
}

describe('every OpenAPI operation has an executable public method', () => {
  it('covers exactly 43 paths and all 71 independent OpenAPI operations', () => {
    expect(Object.keys(specification.paths)).toHaveLength(43);
    expect(operations).toHaveLength(71);
    expect(ZAI_OPERATIONS).toHaveLength(71);
    expect(new Set(ZAI_OPERATIONS.map(operation => `${operation.group}.${operation.name}`)).size).toBe(71);
    expect(ZAI_OPERATIONS.map(operation => `${operation.method} ${operation.path}`).sort()).toEqual(
      operations.map(operation => `${operation.method} ${operation.path}`).sort(),
    );
  });

  it.each(operations)('$method $path uses its declared wire contract', async ({path, method, spec}) => {
    const operation = ZAI_OPERATIONS.find(value => value.path === path && value.method === method)!;
    const parameters = spec.parameters ?? [];
    const pathParameters = parameters.filter(value => value.in === 'path');
    const queryParameters = parameters.filter(value => value.in === 'query');
    const ids = pathParameters.map((parameter, index) => `${parameter.name}-${index} /?#%汉`);
    const query = Object.fromEntries(queryParameters.map(value => [value.name, fixture(value.schema)]));
    const mediaTypes = spec.requestBody?.content;
    const isUpload = !!mediaTypes?.['multipart/form-data'] && !mediaTypes['application/json'];
    const input = mediaTypes ? (isUpload
      ? {path: '目录/input.bin', file: {blob: new Blob(['wire bytes']), filename: 'input.bin'}}
      : fixture(mediaTypes['application/json']?.schema)) : undefined;
    const status = Number(Object.keys(spec.responses).find(value => /^2\d\d$/.test(value)));
    const responseMediaTypes = spec.responses[status]!.content ?? {};
    const binary = !!responseMediaTypes['application/octet-stream'];
    const result = binary ? 'binary result' : fixture(responseMediaTypes['application/json']?.schema);
    const fetcher = vi.fn<typeof fetch>(async requestInput => {
      const request = requestInput as Request;
      const url = new URL(request.url);
      let expectedPath = `/v8${path}`;
      pathParameters.forEach((parameter, index) => { expectedPath = expectedPath.replace(`{${parameter.name}}`, encodeURIComponent(ids[index]!)); });
      expect(request.method).toBe(method.toUpperCase());
      expect(url.pathname).toBe(expectedPath);
      expect(Object.fromEntries(url.searchParams)).toEqual(Object.fromEntries(
        Object.entries(query).map(([name, value]) => [name, String(value)]),
      ));
      expect(request.headers.get('authorization')).toBe('Bearer contract-token');
      expect(request.headers.get('x-client')).toBe('base');
      expect(request.headers.get('x-call')).toBe('operation');
      expect(request.headers.get('accept')).toBe(binary ? 'application/octet-stream' : 'application/json');
      expect(request.signal.aborted).toBe(false);
      if (isUpload) {
        expect(request.headers.get('content-type')).toContain('multipart/form-data; boundary=');
        const form = await request.formData();
        expect(form.get('path')).toBe('目录/input.bin');
        expect(await (form.get('file') as File).text()).toBe('wire bytes');
        expect((form.get('file') as File).name).toBe('input.bin');
      } else if (mediaTypes) {
        const expected = method === 'post' && path === '/sessions/{session_id}/messages'
          ? {...input as object, stream: false} : input;
        expect(await request.json()).toEqual(expected);
        expect(request.headers.get('content-type')).toBe('application/json');
      } else {
        expect(await request.text()).toBe('');
        expect(request.headers.has('content-type')).toBe(false);
      }
      return binary ? new Response(result as string, {status}) : Response.json(result, {status});
    });
    const client = createZAIClient({
      baseUrl: 'https://zai.test/v8/', getToken: () => 'contract-token', fetch: fetcher,
      headers: {'x-client': 'base'},
    });
    const resources = client as unknown as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
    const args: unknown[] = [...ids];
    if (queryParameters.length) args.push(query);
    if (mediaTypes) args.push(input);
    args.push({signal: new AbortController().signal, headers: {'x-call': 'operation'}});
    const actual = await resources[operation.group]![operation.name]!(...args);
    if (binary) {
      expect(actual).toBeInstanceOf(Blob);
      expect(await (actual as Blob).text()).toBe(result);
    } else expect(actual).toEqual(result);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(operation.pathParams).toEqual(pathParameters.map(value => value.name));
    expect(operation.query).toEqual(queryParameters.map(value => value.name));
    expect(operation.hasBody).toBe(!!mediaTypes);
    expect(operation.statuses).toEqual([status]);
  });
});

describe('resource-specific behavior', () => {
  it.each([[{id: 'model-1', archived: true}], {models: [{id: 'model-1', archived: true}], future: 'kept'}])(
    'normalizes model arrays and preserves wrapped metadata', async response => {
      const fetcher = vi.fn<typeof fetch>(async input => {
        expect(new URL((input as Request).url).searchParams.get('all')).toBe('true');
        return Response.json(response);
      });
      const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => 'token', fetch: fetcher});
      expect(await client.models.list({all: 'true'})).toEqual(Array.isArray(response) ? {models: response} : response);
    },
  );

  it.each([null, {}, {models: null}, {models: [null]}, {models: [{id: 3}]}])('rejects invalid models response %j', async body => {
    const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => 'token', fetch: async () => Response.json(body)});
    await expect(client.models.list()).rejects.toMatchObject({code: 'invalid-response'});
  });

  it('passes model history filters and pagination without fetching extra pages', async () => {
    const response = {sessions: [], page: 2, page_size: 15, total: 42, has_more: true};
    const fetcher = vi.fn<typeof fetch>(async input => {
      const url = new URL((input as Request).url);
      expect(Object.fromEntries(url.searchParams)).toEqual({model: 'old/model:1', page: '2', page_size: '15'});
      return Response.json(response);
    });
    const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => 'token', fetch: fetcher});
    expect(await client.sessions.list({model: 'old/model:1', page: 2, page_size: 15})).toEqual(response);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([{custom_data: {selected: true, nested: {value: 1}}}, {custom_data: null}])(
    'passes repository metadata merges and explicit clears unchanged', async body => {
      const fetcher = vi.fn<typeof fetch>(async input => {
        const request = input as Request;
        expect(request.method).toBe('PATCH');
        expect(await request.json()).toEqual(body);
        return Response.json({repository: {custom_data: body.custom_data}});
      });
      const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => 'token', fetch: fetcher});
      await client.repositories.update('agent', 'workspace', 'repo', body);
    },
  );

  it('forces JSON mode while retaining tool calls, usage, and business failures', async () => {
    const result = {content: null, tool_calls: [{function: {name: 'search', arguments: '{}'}}], usage: {tokens: 2}, ok: false};
    const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => 'token', fetch: async input => {
      expect(await (input as Request).json()).toEqual({tools: [{name: 'search'}], stream: false});
      return Response.json(result);
    }});
    expect(await client.messages.send('s', {tools: [{name: 'search'}], stream: true} as never)).toEqual(result);
  });

  it('forces SSE mode, preserves all chunks, and renewals do not reopen an existing stream', async () => {
    const chunk = {choices: [{delta: {tool_calls: [{function: {arguments: '"x"'}}]}}, {delta: {content: 'hi'}}], usage: {tokens: 3}};
    let token = 'first';
    const fetcher = vi.fn<typeof fetch>(async input => {
      const request = input as Request;
      expect(request.headers.get('authorization')).toBe('Bearer first');
      expect(request.headers.get('accept')).toBe('text/event-stream');
      expect(await request.json()).toEqual({stream: true});
      return new Response(`event: chunk\ndata: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {headers: {'content-type': 'text/event-stream'}});
    });
    const client = createZAIClient({baseUrl: 'https://zai.test/v8', getToken: () => token, fetch: fetcher});
    const stream = await client.messages.stream('s', {stream: false} as never);
    token = 'renewed';
    const events = [];
    for await (const event of stream) events.push(event);
    expect(events).toEqual([{type: 'data', event: 'chunk', rawData: JSON.stringify(chunk), data: chunk}, {type: 'done'}]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
