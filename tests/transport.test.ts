import {afterEach, describe, expect, it, vi} from 'vitest';
import {createZAIClient} from '../src/client.js';
import {createZAITokenProvider, type ZAIToken} from '../src/auth.js';
import {ZAIClientError} from '../src/errors.js';
import {createTransport} from '../src/transport.js';
import type {CreateZAIClientOptions} from '../src/types.js';

const baseUrl = 'https://zai.test/v8';
const defaults = {baseUrl, getToken: () => 'token'};
const ok = () => Response.json({ok: false, future: {preserved: true}});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
};

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('transport configuration and request construction', () => {
  it.each([undefined, {}, {baseUrl: '', getToken: () => 'token'}, {baseUrl, getToken: 'token'}])(
    'rejects incomplete client options', input => {
      expect(() => createZAIClient(input as CreateZAIClientOptions)).toThrow(expect.objectContaining({code: 'invalid-input'}));
    },
  );

  it.each(['ftp://zai.test/v8', 'https://user:secret@zai.test/v8', 'https://zai.test/v8?token=bad', 'https://zai.test/v8#hash', 'not a URL'])(
    'rejects unsupported API root %s', root => {
      expect(() => createZAIClient({...defaults, baseUrl: root})).toThrow(expect.objectContaining({code: 'invalid-input'}));
    },
  );

  it('resolves a relative API root against the browser location', async () => {
    vi.stubGlobal('location', {href: 'https://browser.test/dashboard'});
    const fetcher = vi.fn<typeof fetch>(async input => {
      expect((input as Request).url).toBe('https://browser.test/v8/agents');
      return ok();
    });
    const client = createZAIClient({...defaults, baseUrl: '/v8///', fetch: fetcher});
    await client.agents.list();
  });

  it('uses global fetch when no override is provided', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => ok());
    vi.stubGlobal('fetch', fetcher);
    await createZAIClient(defaults).agents.list();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('rejects an unavailable fetch implementation', () => {
    vi.stubGlobal('fetch', undefined);
    expect(() => createZAIClient(defaults)).toThrow(expect.objectContaining({code: 'invalid-input'}));
  });

  it('merges per-call headers and gets a fresh token on each request', async () => {
    let sequence = 0;
    const getToken = vi.fn(() => `token-${++sequence}`);
    const fetcher = vi.fn<typeof fetch>(async input => {
      const request = input as Request;
      expect(request.headers.get('x-shared')).toBe('call');
      expect(request.headers.get('x-base')).toBe('kept');
      expect(request.headers.get('authorization')).toBe(`Bearer token-${sequence}`);
      expect(request.headers.get('accept')).toBe('application/json');
      expect(request.headers.has('content-type')).toBe(false);
      return ok();
    });
    const client = createZAIClient({...defaults, getToken, fetch: fetcher, headers: {
      'x-shared': 'base', 'x-base': 'kept', authorization: 'ignored', 'content-type': 'bad', accept: 'bad',
    }});
    for (let index = 0; index < 2; index++) {
      await expect(client.agents.list({headers: [['x-shared', 'call'], ['authorization', 'also ignored']]})).resolves.toEqual(await ok().json());
    }
    expect(getToken).toHaveBeenCalledTimes(2);
  });

  it('serializes false, zero, and reserved query characters while omitting absent values', async () => {
    const transport = createTransport({...defaults, fetch: async input => {
      const query = Object.fromEntries(new URL((input as Request).url).searchParams);
      expect(query).toEqual({zero: '0', bool: 'false', path: '目录/a+b?c#d&%' });
      return ok();
    }});
    await transport.request({method: 'get', path: '/agents', query: {zero: 0, bool: false, path: '目录/a+b?c#d&%', missing: undefined, nil: null}});
  });

  it.each(['', '  ', '.', '..', 12, null])('rejects invalid path IDs before requesting a token', async id => {
    const getToken = vi.fn(() => 'token');
    const client = createZAIClient({...defaults, getToken, fetch: async () => ok()});
    await expect(client.agents.get(id as string)).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
  });

  it('reports serialization errors as invalid input', async () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const client = createZAIClient({...defaults, fetch: async () => ok()});
    await expect(client.sessions.update('session', {custom_data: cyclic})).rejects.toMatchObject({code: 'invalid-input'});
    await expect(client.agents.list({headers: {'bad\nkey': 'x'}})).rejects.toMatchObject({code: 'invalid-input'});
  });

  it('reports URL query conversion failures as invalid input', async () => {
    const transport = createTransport({...defaults, fetch: async () => ok()});
    await expect(transport.request({method: 'get', path: '/agents', query: {x: {toString() {throw new Error('no string');}}}}))
      .rejects.toMatchObject({code: 'invalid-input'});
  });
});

describe('upload and binary protocols', () => {
  it.each([
    [new File(['contents'], 'source.txt', {type: 'text/plain'}), 'source.txt'],
    [new Blob(['contents'], {type: 'text/plain'}), 'blob'],
    [{blob: new Blob(['contents'], {type: 'text/plain'}), filename: 'named.txt'}, 'named.txt'],
  ])('uploads a File, Blob, or explicitly named Blob', async (file, filename) => {
    const client = createZAIClient({...defaults, headers: {'content-type': 'application/json'}, fetch: async input => {
      const request = input as Request;
      expect(request.headers.get('content-type')).toContain('multipart/form-data; boundary=');
      const form = await request.formData();
      const uploaded = form.get('file') as File;
      expect(uploaded.name).toBe(filename);
      expect(uploaded.type).toBe('text/plain');
      expect(await uploaded.text()).toBe('contents');
      expect(form.get('path')).toBe('inbox/file.txt');
      return ok();
    }});
    await client.sessions.uploadFile('session', {path: 'inbox/file.txt', file: file as Blob});
  });

  it.each([null, 'bad', {}, {path: ''}, {path: 'x', file: {}}, {path: 'x', file: {blob: new Blob(), filename: ''}}])(
    'rejects malformed upload bodies', async body => {
      const transport = createTransport({...defaults, fetch: async () => ok()});
      await expect(transport.request({method: 'post', path: '/files', encoding: 'multipart', body})).rejects.toMatchObject({code: 'invalid-input'});
    },
  );

  it.each([undefined, null, 'release notes'])('uploads ZIP bundles and optional changelog %s', async changelog => {
    const client = createZAIClient({...defaults, fetch: async input => {
      const form = await (input as Request).formData();
      expect((form.get('bundle') as File).name).toBe('skill.zip');
      expect(await (form.get('bundle') as File).text()).toBe('ZIP bytes');
      expect(form.get('changelog')).toBe(changelog ?? null);
      return Response.json({ok: false});
    }});
    expect(await client.skills.validateBundle({bundle: {blob: new Blob(['ZIP bytes']), filename: 'skill.zip'}, changelog})).toEqual({ok: false});
  });

  it('sends direct skill JSON without transforming file content', async () => {
    const files = [{path: 'SKILL.md', media_type: 'text/markdown', content: '# Skill\n\n说明'}];
    const client = createZAIClient({...defaults, fetch: async input => {
      expect((input as Request).headers.get('content-type')).toBe('application/json');
      expect(await (input as Request).json()).toEqual({files, changelog: null});
      return Response.json({revision: {}}, {status: 201});
    }});
    await client.skills.publishRevision('skill', {files, changelog: null});
  });

  it('rejects non-string multipart changelog', async () => {
    const client = createZAIClient({...defaults, fetch: async () => ok()});
    await expect(client.skills.validateBundle({bundle: new Blob(), changelog: 5} as never)).rejects.toMatchObject({code: 'invalid-input'});
  });

  it('returns binary downloads as a Blob with original bytes and MIME type', async () => {
    const bytes = Uint8Array.of(0, 255, 33, 0, 128);
    const client = createZAIClient({...defaults, fetch: async () => new Response(bytes, {headers: {'content-type': 'image/png'}})});
    const blob = await client.sessions.downloadFile('s', {path: 'file.png'});
    expect(blob.type).toBe('image/png');
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes);
  });

  it('rejects a download response without a body', async () => {
    const client = createZAIClient({...defaults, fetch: async () => new Response(null)});
    await expect(client.sessions.downloadFile('s', {path: 'file'})).rejects.toMatchObject({code: 'invalid-response'});
  });
});

describe('token errors and request cancellation', () => {
  it.each(['', '   ', null, 42])('rejects unusable token %s', async token => {
    const fetcher = vi.fn<typeof fetch>(async () => ok());
    const client = createZAIClient({...defaults, getToken: () => token as string, fetch: fetcher});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'authentication'});
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('classifies provider failure without exposing request headers', async () => {
    const cause = new Error('backend unavailable');
    const client = createZAIClient({...defaults, getToken: async () => {throw cause;}});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'authentication', cause});
  });

  it('retains a structured provider error', async () => {
    const error = new ZAIClientError('authentication', 'Token refresh failed');
    const client = createZAIClient({...defaults, getToken: () => {throw error;}});
    await expect(client.agents.list()).rejects.toBe(error);
  });

  it('rejects a token containing illegal header characters', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => ok());
    const client = createZAIClient({...defaults, getToken: () => 'token\nheader', fetch: fetcher});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'authentication'});
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('skips token acquisition and fetch when already aborted', async () => {
    const controller = new AbortController();
    controller.abort('stopped');
    const getToken = vi.fn(() => 'token');
    const fetcher = vi.fn<typeof fetch>(async () => ok());
    const client = createZAIClient({...defaults, getToken, fetch: fetcher});
    await expect(client.agents.list({signal: controller.signal})).rejects.toMatchObject({code: 'aborted', cause: 'stopped'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('cancels one waiter promptly while another completes the same real provider renewal', async () => {
    const token = deferred<ZAIToken>();
    const started = deferred<void>();
    const fetchToken = vi.fn(() => {started.resolve(); return token.promise;});
    const getToken = createZAITokenProvider({fetchToken});
    const fetcher = vi.fn<typeof fetch>(async input => {
      expect((input as Request).headers.get('authorization')).toBe('Bearer shared-renewal');
      return ok();
    });
    const client = createZAIClient({...defaults, getToken, fetch: fetcher});
    const controller = new AbortController();
    const first = client.agents.list({signal: controller.signal});
    const second = client.agents.list();
    await started.promise;
    controller.abort('only first');
    await expect(first).rejects.toMatchObject({code: 'aborted', cause: 'only first'});
    expect(fetcher).not.toHaveBeenCalled();
    token.resolve({token: 'shared-renewal', expiresAt: Math.floor(Date.now() / 1000) + 1000});
    await expect(second).resolves.toEqual(await ok().json());
    await client.agents.list();
    expect(fetchToken).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('handles a later rejected token promise after its only waiter was cancelled', async () => {
    const token = deferred<string>();
    const started = deferred<void>();
    const client = createZAIClient({...defaults, getToken: () => {started.resolve(); return token.promise;}});
    const controller = new AbortController();
    const result = client.agents.list({signal: controller.signal});
    await started.promise;
    controller.abort();
    await expect(result).rejects.toMatchObject({code: 'aborted'});
    token.reject(new Error('later refresh failure'));
    await Promise.resolve();
  });

  it('normalizes a fetch aborted during its request', async () => {
    const controller = new AbortController();
    const client = createZAIClient({...defaults, fetch: async () => {
      controller.abort('fetch abort');
      throw new TypeError('AbortError');
    }});
    await expect(client.agents.list({signal: controller.signal})).rejects.toMatchObject({code: 'aborted', cause: 'fetch abort'});
  });

  it('cancels a response received after the signal was aborted', async () => {
    const controller = new AbortController();
    const cancel = vi.fn();
    const client = createZAIClient({...defaults, fetch: async () => {
      controller.abort();
      return new Response(new ReadableStream({cancel}), {headers: {'content-type': 'application/json'}});
    }});
    await expect(client.agents.list({signal: controller.signal})).rejects.toMatchObject({code: 'aborted'});
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

describe('HTTP and response failures', () => {
  it.each([401, 403, 404, 429, 500, 503])('does not replay an HTTP %s failed POST', async status => {
    const body = {error: {message: 'server rejection', code: 'custom'}};
    const fetcher = vi.fn<typeof fetch>(async () => Response.json(body, {status, headers: {'retry-after': '3'}}));
    const client = createZAIClient({...defaults, fetch: fetcher});
    await expect(client.messages.send('s', {messages: ['input']})).rejects.toMatchObject({
      code: status === 401 || status === 403 ? 'authentication' : 'http', status,
      message: 'server rejection', body, method: 'POST', path: '/sessions/{session_id}/messages',
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['{"error":"text failure"}', 'text failure', {error: 'text failure'}],
    ['{"error":{"other":true}}', 'ZAI request failed with HTTP 400.', {error: {other: true}}],
    ['{"detail":"failure"}', 'ZAI request failed with HTTP 400.', {detail: 'failure'}],
    ['proxy unavailable', 'ZAI request failed with HTTP 400.', 'proxy unavailable'],
    ['', 'ZAI request failed with HTTP 400.', ''],
  ])('preserves HTTP error bodies %s', async (text, message, body) => {
    const headers = new Headers({'x-trace': 'trace'});
    const client = createZAIClient({...defaults, fetch: async () => new Response(text as string, {status: 400, headers})});
    const failure = await client.agents.list().catch(error => error as ZAIClientError);
    expect(failure).toMatchObject({code: 'http', body, message});
    expect((failure as ZAIClientError).headers?.get('x-trace')).toBe('trace');
  });

  it('classifies a fetch failure as network', async () => {
    const cause = new TypeError('connection refused');
    const fetcher = vi.fn<typeof fetch>(async () => {throw cause;});
    const client = createZAIClient({...defaults, fetch: fetcher});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'network', cause});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([200, 500])('classifies a failed HTTP %s response body read as network', async status => {
    const cause = new Error('body disconnected');
    const body = new ReadableStream({start(controller) {controller.error(cause);}});
    const client = createZAIClient({...defaults, fetch: async () => new Response(body, {status, headers: {'content-type': 'application/json'}})});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'network', cause, status});
  });

  it.each([201, 202, 204])('rejects HTTP %s when the operation declares only 200', async status => {
    const client = createZAIClient({...defaults, fetch: async () => new Response(null, {status})});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'invalid-response', status});
  });

  it.each(['text/html', '', 'application/xml'])('rejects a successful non-JSON response %s and cancels it', async contentType => {
    const cancel = vi.fn(() => Promise.reject(new Error('cleanup failed')));
    const body = new ReadableStream({cancel});
    const client = createZAIClient({...defaults, fetch: async () => new Response(body, {headers: contentType ? {'content-type': contentType} : {}})});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'invalid-response'});
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it.each(['application/json; charset=UTF-8', 'application/problem+json', 'APPLICATION/JSON'])('accepts JSON content type %s', async contentType => {
    const client = createZAIClient({...defaults, fetch: async () => new Response('null', {headers: {'content-type': contentType}})});
    await expect(client.agents.list()).resolves.toBe(null);
  });

  it.each(['{broken', ''])('reports malformed JSON %s with the original body', async body => {
    const client = createZAIClient({...defaults, fetch: async () => new Response(body, {headers: {'content-type': 'application/json'}})});
    await expect(client.agents.list()).rejects.toMatchObject({code: 'invalid-response', status: 200, body});
  });

  it('does not replay a failed SSE response', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({error: 'expired'}, {status: 401}));
    const getToken = vi.fn(() => 'token');
    const client = createZAIClient({...defaults, getToken, fetch: fetcher});
    await expect(client.messages.stream('s')).rejects.toMatchObject({code: 'authentication'});
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(getToken).toHaveBeenCalledTimes(1);
  });
});
