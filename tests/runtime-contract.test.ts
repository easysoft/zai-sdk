import {describe, expect, it, vi} from 'vitest';
import {ZAIClientError} from '../src/errors.js';
import {createTransport} from '../src/transport.js';
import type {CreateZAIClientOptions, ZAIOperationRequest, ZAIRequestOptions} from '../src/types.js';

const operation: ZAIOperationRequest = {method: 'post', path: '/contract', auth: 'user'};
const setup = (options: Partial<CreateZAIClientOptions> = {}) => {
  const requests: Request[] = [];
  const getToken = vi.fn(() => 'opaque-token');
  const fetch = vi.fn<typeof globalThis.fetch>(async input => {
    requests.push(input as Request);
    return Response.json({ok: true});
  });
  const transport = createTransport({baseUrl: 'https://zai.test/v1/zai', getToken, fetch, ...options} as CreateZAIClientOptions);
  return {transport, requests, getToken, fetch};
};

describe('idempotent writes', () => {
  it('generates a fresh key per marked call, preserves it in flight, and leaves reads alone', async () => {
    const {transport, requests} = setup();
    await transport.request({...operation, idempotencyRequired: true});
    await transport.request({...operation, idempotencyRequired: true});
    await transport.request({...operation, method: 'get'});
    const keys = requests.map(request => request.headers.get('idempotency-key'));
    expect(keys[0]).toMatch(/^[a-f0-9]{32}$/);
    expect(keys[1]).toMatch(/^[a-f0-9]{32}$/);
    expect(keys[0]).not.toBe(keys[1]);
    expect(keys[2]).toBeNull();
  });

  it('prefers the explicit option over call headers over client headers and supports replay keys', async () => {
    const {transport, requests} = setup({headers: {'idempotency-key': 'client'}});
    await transport.request({...operation, idempotencyRequired: true});
    await transport.request({...operation, options: {headers: {'Idempotency-Key': 'call'}}});
    for (let attempt = 0; attempt < 2; attempt++) {
      await transport.request({...operation, options: {idempotencyKey: 'retry', headers: {'idempotency-key': 'call'}}});
    }
    expect(requests.map(request => request.headers.get('idempotency-key'))).toEqual(['client', 'call', 'retry', 'retry']);
  });

  it.each(['', ' ', 'x'.repeat(129), null, 1])('rejects an invalid explicit key %j before authentication', async value => {
    const {transport, getToken, fetch} = setup();
    await expect(transport.request({...operation, idempotencyRequired: true, options: {idempotencyKey: value} as ZAIRequestOptions}))
      .rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['', ' ', 'x'.repeat(129)])('rejects an invalid existing header %j instead of replacing it', async value => {
    const {transport, getToken} = setup({headers: {'idempotency-key': value}});
    await expect(transport.request({...operation, idempotencyRequired: true})).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
  });

  it('does not retry a failed idempotent request', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({error: 'unavailable'}, {status: 503}));
    const {transport} = setup({fetch});
    await expect(transport.request({...operation, idempotencyRequired: true})).rejects.toMatchObject({status: 503});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('token selection and user scope', () => {
  it.each([
    ['admin', undefined, true], ['user', undefined, false], ['user-only', undefined, false],
    ['user', 'admin', true], ['user', 'user', false], ['admin', 'admin', true], ['user-only', 'user', false],
  ] as const)('selects the requested permitted token for %s/%s', async (auth, tokenType, admin) => {
    const {transport, getToken, requests} = setup();
    await transport.request({...operation, auth, options: {tokenType}});
    expect(getToken.mock.calls).toEqual([[admin]]);
    expect(requests[0]!.headers.get('authorization')).toBe('Bearer opaque-token');
  });

  it.each([
    ['admin', 'user'], ['user-only', 'admin'], ['user', 'invalid'], ['invalid', undefined],
  ])('rejects an incompatible token selection %s/%s before authentication', async (auth, tokenType) => {
    const {transport, getToken, fetch} = setup();
    await expect(transport.request({...operation, auth, options: {tokenType}} as ZAIOperationRequest)).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the user provider for user-only operations in automatic mode', async () => {
    const requests: Request[] = [];
    const {transport} = setup({getToken: undefined, auth: {mode: 'auto', appID: 'app', appKey: 'key', userID: 'user'}, fetch: async input => {
      const request = input as Request;
      requests.push(request);
      return Response.json(request.url.endsWith('/signing_secret') ? {app_id: 'app', signing_secret: 'secret', token_prefix: 'ek-'} : {ok: true});
    }});
    await transport.request({...operation, auth: 'user-only'});
    expect(requests.map(request => request.headers.get('authorization')!.slice(0, 10))).toEqual(['Bearer ak-', 'Bearer ek-']);
  });

  it('keeps session_id while selecting an explicit user scope for administrators', async () => {
    const {transport, requests, getToken} = setup();
    await transport.request({...operation, auth: 'admin', validation: 'user-scope', query: {external_user_id: 'user+1', session_id: 'session'}});
    await transport.request({...operation, validation: 'user-scope', query: {session_id: 'session'}});
    expect(Object.fromEntries(new URL(requests[0]!.url).searchParams)).toEqual({external_user_id: 'user+1', session_id: 'session'});
    expect(Object.fromEntries(new URL(requests[1]!.url).searchParams)).toEqual({session_id: 'session'});
    expect(getToken.mock.calls).toEqual([[true], [false]]);
  });

  it.each([
    ['admin', undefined], ['admin', {external_user_id: ''}], ['admin', {external_user_id: ' '}],
    ['admin', {external_user_id: 1}], ['admin', {external_user_id: 'x'.repeat(129)}],
    ['user', {external_user_id: 'other'}], ['user', {external_user_id: null}],
  ])('rejects an invalid %s scope %j before authentication', async (auth, query) => {
    const {transport, getToken} = setup();
    await expect(transport.request({...operation, auth, validation: 'user-scope', query} as ZAIOperationRequest))
      .rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
  });
});

describe('binary and attachment uploads', () => {
  it.each([new Blob([Uint8Array.of(0, 255, 1)], {type: 'image/png'}), new File([], 'empty.txt'), undefined])(
    'sends binary bytes without JSON or multipart conversion (%j)', async body => {
      const {transport, requests} = setup({headers: {'content-type': 'text/plain'}});
      await transport.request({...operation, encoding: 'binary', body, query: {name: '文件.bin'}});
      expect(requests[0]!.headers.get('content-type')).toBe('application/octet-stream');
      expect(new Uint8Array(await requests[0]!.arrayBuffer())).toEqual(body ? new Uint8Array(await body.arrayBuffer()) : new Uint8Array());
      expect(new URL(requests[0]!.url).searchParams.get('name')).toBe('文件.bin');
    },
  );

  it.each(['text', {}, null, new Uint8Array([1])])('rejects non-Blob binary input %j', async body => {
    const {transport, getToken} = setup();
    await expect(transport.request({...operation, encoding: 'binary', body})).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
  });

  it('uploads an immutable attachment without adding a path', async () => {
    const {transport, requests} = setup();
    await transport.request({...operation, encoding: 'multipart', body: {file: {blob: new Blob(['attachment']), filename: 'a.txt'}}});
    const form = await requests[0]!.formData();
    expect(form.has('path')).toBe(false);
    expect((form.get('file') as File).name).toBe('a.txt');
    expect(await (form.get('file') as File).text()).toBe('attachment');
  });
});

describe('exact file selectors and tool results', () => {
  it.each(['file-query', 'file-body'] as const)('accepts exactly one selector for %s', async validation => {
    const {transport, requests} = setup();
    for (const selector of [{path: ' directory/file.txt '}, {file_id: 'attachment-id'}]) {
      await transport.request({...operation, validation, ...(validation === 'file-query' ? {query: selector} : {body: selector})});
    }
    const values = await Promise.all(requests.map(request => validation === 'file-query' ? Object.fromEntries(new URL(request.url).searchParams) : request.json()));
    expect(values).toEqual([{path: ' directory/file.txt '}, {file_id: 'attachment-id'}]);
  });

  it.each([undefined, null, {}, [], {path: ''}, {path: 'x'.repeat(4097)}, {path: 1}, {file_id: ''}, {file_id: null}, {path: 'x', file_id: 'id'}, {path: 'x', extra: true}])(
    'rejects an invalid file selector %j for queries and serialized bodies', async value => {
      const {transport, getToken} = setup();
      for (const validation of ['file-query', 'file-body'] as const) {
        await expect(transport.request({...operation, validation, ...(validation === 'file-query' ? {query: value as object} : {body: value})}))
          .rejects.toMatchObject({code: 'invalid-input'});
      }
      expect(getToken).not.toHaveBeenCalled();
    },
  );

  it.each([null, 0, false, '', [], {answer: 'ok'}])('preserves a serializable tool output %j', async output => {
    const {transport, requests} = setup();
    await transport.request({...operation, validation: 'tool-result', body: {output}});
    expect(await requests[0]!.json()).toEqual({output});
  });

  it('validates and sends the same single JSON serialization', async () => {
    const {transport, requests} = setup();
    const toJSON = vi.fn().mockReturnValueOnce({output: null}).mockReturnValue({});
    await transport.request({...operation, validation: 'tool-result', body: {toJSON}});
    expect(toJSON).toHaveBeenCalledTimes(1);
    expect(await requests[0]!.json()).toEqual({output: null});
    const error = {code: 'failed', message: 'Tool failed'};
    await transport.request({...operation, validation: 'tool-result', body: {error}});
    expect(await requests[1]!.json()).toEqual({error});
  });

  it.each([
    undefined, null, [], {}, {output: undefined}, {output: () => 1}, {output: Symbol('absent')}, {output: {toJSON: () => undefined}},
    {output: null, error: {code: 'x', message: 'x'}}, {output: null, extra: true}, {error: null},
    {error: {code: 'x'}}, {error: {code: 1, message: 'x'}}, {error: {code: 'x', message: 'x', extra: true}},
  ])('rejects a missing or invalid serialized tool result %j', async body => {
    const {transport, getToken, fetch} = setup();
    await expect(transport.request({...operation, validation: 'tool-result', body})).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('server error diagnostics', () => {
  const info = {code: 'runner_error', message: 'Original diagnostic', reason_code: 'starting', user_message: 'Please wait', details: {status: 'starting'}};

  it.each([400, 403])('exposes valid diagnostics without replacing the HTTP %s category, message or body', async status => {
    const body = {error: 'Legacy message', error_info: {...info, retryable: true}};
    const {transport} = setup({fetch: async () => Response.json(body, {status})});
    await expect(transport.request(operation)).rejects.toMatchObject({code: status === 403 ? 'authentication' : 'http', message: 'Legacy message', body, errorInfo: body.error_info});
    expect(new ZAIClientError('invalid-response', 'Stream failure', {body: {error_info: info}}).errorInfo).toBe(info);
  });

  it.each([undefined, null, [], {}, {...info, code: 1}, {...info, message: undefined}, {...info, reason_code: null}, {...info, user_message: false}, {...info, details: null}, {...info, details: []}, {...info, retryable: 'yes'}])(
    'keeps malformed diagnostics only in the original body (%j)', error_info => {
      const body = {error: 'Legacy error', error_info};
      const error = new ZAIClientError('http', 'Legacy error', {body});
      expect(error.errorInfo).toBeUndefined();
      expect(error.body).toBe(body);
    },
  );
});
