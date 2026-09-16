import {describe, expect, it, vi} from 'vitest';
import {ZAIClientError} from '../src/errors.js';
import {parseZAIStream, type ZAIStreamEvent} from '../src/stream.js';

const encoder = new TextEncoder();
const done = 'data: [DONE]\n\n';

function source(chunks: (string | Uint8Array)[] = [], options: {
  close?: boolean; contentType?: string | null; cancel?: () => void | Promise<void>;
} = {}) {
  const cancel = vi.fn(options.cancel ?? (() => undefined));
  const input = [...chunks];
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(value) { controller = value; },
    pull(value) {
      const chunk = input.shift();
      if (chunk !== undefined) value.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      else if (options.close) value.close();
    },
    cancel,
  }, {highWaterMark: 0});
  const headers = new Headers({'x-test': 'stream'});
  if (options.contentType !== null) headers.set('content-type', options.contentType ?? 'text/event-stream');
  const response = new Response(body, {headers});
  return {response, cancel, controller};
}

async function collect(stream: AsyncIterable<ZAIStreamEvent>) {
  const result: ZAIStreamEvent[] = [];
  for await (const event of stream) result.push(event);
  return result;
}

describe('SSE data fidelity', () => {
  it('preserves named events, IDs, choices, tool calls, usage, and unknown fields', async () => {
    const chunk = {
      choices: [
        {index: 0, delta: {tool_calls: [{index: 0, function: {arguments: '{'}}]}},
        {index: 1, delta: {content: '你好'}, finish_reason: null},
      ],
      usage: {prompt_tokens: 2, completion_tokens: 3},
      future: {enabled: true},
    };
    const rawData = JSON.stringify(chunk);
    const {response, cancel} = source([`event: chunk\nid: 123\ndata: ${rawData}\n\n${done}data: invalid\n\n`]);
    expect(await collect(parseZAIStream(response))).toEqual([
      {type: 'data', event: 'chunk', id: '123', rawData, data: chunk}, {type: 'done'},
    ]);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it('handles UTF-8 characters, CRLF, and delimiters split at every byte', async () => {
    const bytes = encoder.encode('event: message\r\nid: \r\ndata: {"content":"你好🌏"}\r\n\r\ndata: [DONE]\r\n\r\n');
    const {response} = source(Array.from(bytes, byte => Uint8Array.of(byte)));
    expect(await collect(parseZAIStream(response))).toEqual([
      {type: 'data', event: 'message', id: '', rawData: '{"content":"你好🌏"}', data: {content: '你好🌏'}},
      {type: 'done'},
    ]);
  });

  it('supports multiline JSON, comments, empty frames and ignored SSE fields', async () => {
    const {response} = source([
      ': heartbeat\n\nretry: 5000\nretry: invalid\nfuture: ignored\n',
      'data: {"choices": [],\ndata: "usage": {"total_tokens": 5}}\n\n', done,
    ]);
    expect(await collect(parseZAIStream(response))).toEqual([
      {
        type: 'data', event: 'message',
        rawData: '{"choices": [],\n"usage": {"total_tokens": 5}}',
        data: {choices: [], usage: {total_tokens: 5}},
      }, {type: 'done'},
    ]);
  });

  it.each(['null', '42', '"text"', '[]', '{"error":null}'])(
    'retains a valid JSON value %s without imposing a completion schema', async rawData => {
      const {response} = source([`data: ${rawData}\n\n`, done]);
      expect(await collect(parseZAIStream(response))).toEqual([
        {type: 'data', event: 'message', rawData, data: JSON.parse(rawData)}, {type: 'done'},
      ]);
    },
  );

  it('accepts content-type parameters and casing', async () => {
    const {response} = source([done], {contentType: 'Text/Event-Stream; charset=utf-8'});
    expect(await collect(parseZAIStream(response))).toEqual([{type: 'done'}]);
  });
});

describe('invalid and failed streams', () => {
  it('preserves invalid JSON and response metadata on a typed error', async () => {
    const {response, cancel} = source(['data: {broken\n\n']);
    const stream = parseZAIStream(response);
    await expect(stream.next()).rejects.toMatchObject({
      name: 'ZAIClientError', code: 'invalid-response', body: '{broken', status: 200,
      headers: response.headers, cause: expect.any(SyntaxError),
    });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    expect(await stream.next()).toEqual({done: true, value: undefined});
  });

  it.each([
    ['event: error\ndata: {"message":"failed"}\n\n', {message: 'failed'}],
    ['data: {"error":{"code":"bad_request"}}\n\n', {error: {code: 'bad_request'}}],
    ['data: {"error":"failed"}\n\n', {error: 'failed'}],
  ])('rejects a server error event %s', async (text, body) => {
    const {response, cancel} = source([text as string]);
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({code: 'invalid-response', body});
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not treat an error event carrying the done sentinel as successful', async () => {
    const {response} = source(['event: error\n', done]);
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({code: 'invalid-response', body: '[DONE]'});
  });

  it.each(['data: {}\n\n', 'data: [DONE]', ''])('rejects EOF without a dispatched done sentinel', async text => {
    const {response} = source([text], {close: true});
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({
      code: 'invalid-response', message: expect.stringContaining('completion sentinel'),
    });
    expect(response.body?.locked).toBe(false);
  });

  it.each([
    [Uint8Array.of(0xff), false],
    [Uint8Array.of(0xe4, 0xbd), true],
  ])('rejects invalid and incomplete UTF-8', async (bytes, close) => {
    const {response} = source([bytes as Uint8Array], {close: close as boolean});
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({code: 'invalid-response'});
    expect(response.body?.locked).toBe(false);
  });

  it('limits a valid data line that never terminates', async () => {
    const {response, cancel} = source(['data: ' + 'a'.repeat(1024 * 1024 + 1)]);
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({code: 'invalid-response'});
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('limits data accumulated across multiple lines without a frame delimiter', async () => {
    const line = 'data: ' + 'a'.repeat(1024) + '\n';
    const {response} = source([line.repeat(1025)]);
    await expect(collect(parseZAIStream(response))).rejects.toMatchObject({code: 'invalid-response'});
  });

  it('resets the buffer limit between frames', async () => {
    const text = 'a'.repeat(600_000);
    const frame = `data: ${JSON.stringify(text)}\n\n`;
    const {response} = source([frame, frame, done]);
    expect(await collect(parseZAIStream(response))).toHaveLength(3);
  });

  it.each(['application/json', null])('rejects non-SSE content and cancels its body', contentType => {
    const {response, cancel} = source([], {contentType});
    expect(() => parseZAIStream(response)).toThrow(expect.objectContaining({code: 'invalid-response'}));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it('rejects a missing response body', () => {
    const response = new Response(null, {headers: {'content-type': 'text/event-stream'}});
    expect(() => parseZAIStream(response)).toThrow(expect.objectContaining({code: 'invalid-response'}));
  });

  it('reports an already locked body without taking its ownership', async () => {
    const {response} = source();
    const reader = response.body!.getReader();
    expect(() => parseZAIStream(response)).toThrow(expect.objectContaining({code: 'invalid-response'}));
    expect(response.body?.locked).toBe(true);
    await reader.cancel();
    reader.releaseLock();
  });

  it('classifies a reader failure as a network error and does not reconnect', async () => {
    const {response, controller} = source();
    const stream = parseZAIStream(response);
    const next = stream.next();
    const cause = new Error('connection reset');
    controller.error(cause);
    await expect(next).rejects.toMatchObject({code: 'network', cause});
    expect(response.body?.locked).toBe(false);
    expect(await stream.next()).toEqual({done: true, value: undefined});
  });
});

describe('SSE body lifecycle', () => {
  it('releases the body before exposing done and ignores subsequent data', async () => {
    const {response, cancel} = source([done, 'data: {}\n\n']);
    const stream = parseZAIStream(response);
    expect(response.body?.locked).toBe(true);
    expect(await stream.next()).toEqual({done: false, value: {type: 'done'}});
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    expect(await stream.next()).toEqual({done: true, value: undefined});
  });

  it('releases an unstarted iterator on return', async () => {
    const {response, cancel} = source();
    const stream = parseZAIStream(response);
    expect(await stream.return!()).toEqual({done: true, value: undefined});
    expect(await stream.return!()).toEqual({done: true, value: undefined});
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    expect(await stream.next()).toEqual({done: true, value: undefined});
  });

  it('releases the body when a for-await loop breaks', async () => {
    const {response, cancel} = source(['data: {}\n\n']);
    for await (const event of parseZAIStream(response)) {
      expect(event.type).toBe('data');
      break;
    }
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it('returns promptly when next is waiting for data', async () => {
    const {response, cancel} = source();
    const stream = parseZAIStream(response);
    const next = stream.next();
    const returned = stream.return!();
    await expect(next).resolves.toEqual({done: true, value: undefined});
    await expect(returned).resolves.toEqual({done: true, value: undefined});
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('propagates consumer throw while releasing an unstarted iterator', async () => {
    const {response, cancel} = source();
    const stream = parseZAIStream(response);
    const error = new Error('consumer stopped');
    await expect(stream.throw!(error)).rejects.toBe(error);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it.each([false, true])('cancels before first next (already aborted: %s)', async alreadyAborted => {
    const controller = new AbortController();
    const cause = new Error('cancel');
    if (alreadyAborted) controller.abort(cause);
    const {response, cancel} = source();
    const stream = parseZAIStream(response, controller.signal);
    if (!alreadyAborted) controller.abort(cause);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
    await expect(stream.next()).rejects.toMatchObject({code: 'aborted', cause});
  });

  it('aborts a pending read without waiting for a slow underlying cancel', async () => {
    const controller = new AbortController();
    const {response, cancel} = source([], {cancel: () => new Promise(() => undefined)});
    const stream = parseZAIStream(response, controller.signal);
    const next = stream.next();
    controller.abort();
    await expect(next).rejects.toMatchObject({code: 'aborted'});
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(response.body?.locked).toBe(false);
  });

  it('aborts between events and removes its listener on normal completion', async () => {
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    const {response, cancel} = source(['data: {}\n\ndata: {}\n\n']);
    const stream = parseZAIStream(response, controller.signal);
    await stream.next();
    controller.abort();
    await expect(stream.next()).rejects.toMatchObject({code: 'aborted'});
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('ignores errors from source cleanup without masking successful completion', async () => {
    const {response} = source([done], {cancel: () => Promise.reject(new Error('cancel failed'))});
    expect(await collect(parseZAIStream(response))).toEqual([{type: 'done'}]);
    expect(response.body?.locked).toBe(false);
  });

  it('keeps completed streams completed if their signal is aborted later', async () => {
    const controller = new AbortController();
    const {response} = source([done]);
    const stream = parseZAIStream(response, controller.signal);
    await collect(stream);
    controller.abort();
    expect(await stream.next()).toEqual({done: true, value: undefined});
  });

  it('uses the SDK error class for protocol failures', async () => {
    const {response} = source(['data: bad\n\n']);
    await expect(collect(parseZAIStream(response))).rejects.toBeInstanceOf(ZAIClientError);
  });
});
