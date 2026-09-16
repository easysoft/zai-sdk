import {createParser, type EventSourceMessage} from 'eventsource-parser';
import {ZAIClientError} from './errors.js';

/** SSE data is intentionally unfiltered so new fields and model capabilities survive. */
export type ZAIStreamEvent =
  | {type: 'data'; event: string; id?: string; rawData: string; data: unknown}
  | {type: 'done'};

const STREAM_BUFFER_LIMIT = 1024 * 1024;

/**
 * Owns the response body immediately. Call return() or abort the request signal
 * when abandoning a stream, including before the first next() call.
 */
export function parseZAIStream(response: Response, signal?: AbortSignal): AsyncIterableIterator<ZAIStreamEvent> {
  const invalid = (message: string, body?: unknown, cause?: unknown) => new ZAIClientError(
    'invalid-response', message, {status: response.status, headers: response.headers, body, cause},
  );
  if (!response.body) throw invalid('ZAI returned an empty message stream.');

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = response.body.getReader();
  } catch (cause) {
    throw invalid('The ZAI message stream is already being consumed.', undefined, cause);
  }

  let cleaned = false;
  let closed = false;
  let abortError: ZAIClientError | undefined;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    signal?.removeEventListener('abort', onAbort);
    // Cancellation settles pending reads immediately, even if the underlying
    // source's asynchronous cleanup is slow. Never let it delay request abort.
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  };
  const onAbort = () => {
    abortError = new ZAIClientError('aborted', 'The message stream was aborted.', {cause: signal?.reason});
    cleanup();
  };

  const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'text/event-stream') {
    cleanup();
    throw invalid('ZAI returned a non-SSE response for a streaming message.');
  }

  signal?.addEventListener('abort', onAbort, {once: true});
  if (signal?.aborted) onAbort();

  const events: EventSourceMessage[] = [];
  const decoder = new TextDecoder('utf-8', {fatal: true});
  const parser = createParser({
    maxBufferSize: STREAM_BUFFER_LIMIT,
    onEvent: event => events.push(event),
    onError: error => {
      // Unknown SSE fields and invalid retry hints are ignored by the SSE
      // protocol. This client never reconnects; only buffer overflow is fatal.
      if (error.type === 'max-buffer-size-exceeded') throw error;
    },
  });

  function decode(value?: Uint8Array): void {
    try {
      const text = value === undefined ? decoder.decode() : decoder.decode(value, {stream: true});
      parser.feed(text);
    } catch (cause) {
      throw invalid('ZAI returned invalid or oversized SSE data.', undefined, cause);
    }
  }

  function parseEvent(event: EventSourceMessage): ZAIStreamEvent {
    if (event.data === '[DONE]' && event.event !== 'error') return {type: 'done'};
    let data: unknown;
    try {
      data = JSON.parse(event.data);
    } catch (cause) {
      throw invalid('ZAI returned invalid JSON in the message stream.', event.data, cause);
    }
    if (event.event === 'error'
      || (typeof data === 'object' && data !== null && 'error' in data && data.error != null)) {
      throw invalid('ZAI returned an error in the message stream.', data);
    }
    return {
      type: 'data', event: event.event || 'message',
      ...(event.id === undefined ? {} : {id: event.id}),
      rawData: event.data, data,
    };
  }

  async function* read(): AsyncGenerator<ZAIStreamEvent> {
    try {
      while (!closed) {
        if (abortError) throw abortError;
        const event = events.shift();
        if (event) {
          const parsed = parseEvent(event);
          if (parsed.type === 'done') {
            closed = true;
            // Consumers may stop at the sentinel without requesting another item.
            cleanup();
            yield parsed;
            return;
          }
          yield parsed;
          continue;
        }
        let result: ReadableStreamReadResult<Uint8Array>;
        try {
          result = await reader.read();
        } catch (cause) {
          if (abortError) throw abortError;
          if (closed) return;
          throw new ZAIClientError('network', 'The ZAI message stream was interrupted.', {
            cause, status: response.status, headers: response.headers,
          });
        }
        if (abortError) throw abortError;
        if (closed) return;
        if (result.done) {
          // Flush the decoder to reject a truncated UTF-8 character at EOF.
          decode();
          throw invalid('ZAI ended the message stream without a completion sentinel.');
        }
        decode(result.value);
      }
    } finally {
      closed = true;
      events.length = 0;
      cleanup();
    }
  }

  const generator = read();
  return {
    [Symbol.asyncIterator]() { return this; },
    async next() {
      if (abortError) throw abortError;
      if (closed) return {done: true, value: undefined};
      return generator.next();
    },
    async return() {
      closed = true;
      cleanup();
      return generator.return(undefined);
    },
    async throw(error?: unknown) {
      closed = true;
      cleanup();
      return generator.throw(error);
    },
  };
}
