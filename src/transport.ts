import createClient from 'openapi-fetch';
import {ZAIClientError} from './errors.js';
import type {CreateZAIClientOptions, ZAIOperationRequest, ZAITransport, ZAIUploadFile} from './types.js';

interface DynamicOpenAPIClient {
  request(method: ZAIOperationRequest['method'], path: string, init: {
    params: {path?: Record<string, string>; query?: object};
    body?: string | FormData;
    bodySerializer: (value: unknown) => BodyInit;
    pathSerializer: (path: string, params: Record<string, unknown>) => string;
    querySerializer: (query: Record<string, unknown>) => string;
    signal?: AbortSignal;
    headers: Headers;
    parseAs: 'stream';
    fetch: (request: Request) => Promise<Response>;
  }): Promise<{response: Response}>;
}

function aborted(signal: AbortSignal): ZAIClientError {
  return new ZAIClientError('aborted', 'The request was cancelled.', {cause: signal.reason});
}

/** Cancelling a waiter must not cancel a shared token renewal. */
async function waitForToken(getToken: CreateZAIClientOptions['getToken'], signal?: AbortSignal): Promise<string> {
  if (signal?.aborted) throw aborted(signal);
  const pending = Promise.resolve().then(getToken);
  let listener: (() => void) | undefined;
  try {
    const token = await (signal ? Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        listener = () => reject(aborted(signal));
        signal.addEventListener('abort', listener, {once: true});
        if (signal.aborted) listener();
      }),
    ]) : pending);
    if (typeof token !== 'string' || !token.trim()) {
      throw new ZAIClientError('authentication', 'The token provider returned an empty token.');
    }
    if (signal?.aborted) throw aborted(signal);
    return token;
  } catch (cause) {
    if (cause instanceof ZAIClientError) throw cause;
    throw new ZAIClientError('authentication', 'Unable to obtain an authentication token.', {cause});
  } finally {
    if (signal && listener) signal.removeEventListener('abort', listener);
  }
}

function isBlob(value: unknown): value is Blob {
  return typeof value === 'object' && value !== null
    && typeof (value as Blob).arrayBuffer === 'function'
    && typeof (value as Blob).stream === 'function'
    && typeof (value as Blob).size === 'number'
    && typeof (value as Blob).type === 'string';
}

function appendFile(form: FormData, key: string, value: ZAIUploadFile): void {
  const file = isBlob(value) ? value : value?.blob;
  const filename = isBlob(value) ? ('name' in value && typeof value.name === 'string' ? value.name : 'blob') : value?.filename;
  if (!isBlob(file) || typeof filename !== 'string' || !filename.trim()) {
    throw new ZAIClientError('invalid-input', 'Uploads require a Blob or a named Blob.');
  }
  form.append(key, file, filename);
}

function serializeBody(input: ZAIOperationRequest): string | FormData | undefined {
  const {body, encoding} = input;
  if (body === undefined) return undefined;
  if (encoding === 'multipart' || (encoding === 'bundle' && typeof body === 'object' && body !== null && 'bundle' in body)) {
    if (typeof body !== 'object' || body === null) throw new ZAIClientError('invalid-input', 'A multipart body is required.');
    const values = body as Record<string, unknown>;
    const form = new FormData();
    if (encoding === 'multipart') {
      if (typeof values.path !== 'string' || !values.path.trim()) throw new ZAIClientError('invalid-input', 'An upload target path is required.');
      appendFile(form, 'file', values.file as ZAIUploadFile);
      form.append('path', values.path);
    } else {
      appendFile(form, 'bundle', values.bundle as ZAIUploadFile);
      if (values.changelog !== undefined && values.changelog !== null) {
        if (typeof values.changelog !== 'string') throw new ZAIClientError('invalid-input', 'The changelog must be a string.');
        form.append('changelog', values.changelog);
      }
    }
    return form;
  }
  return JSON.stringify(body);
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const error = body.error;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  }
  return `ZAI request failed with HTTP ${status}.`;
}

function discardResponse(response: Response): void {
  // Cleanup must neither delay cancellation nor replace the original failure.
  void response.body?.cancel().catch(() => undefined);
}

export function createTransport(options: CreateZAIClientOptions): ZAITransport {
  if (!options || typeof options.getToken !== 'function' || typeof options.baseUrl !== 'string' || !options.baseUrl.trim()) {
    throw new ZAIClientError('invalid-input', 'baseUrl and getToken are required.');
  }
  let baseUrl: string;
  try {
    const url = new URL(options.baseUrl, globalThis.location?.href);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid API root');
    baseUrl = url.href.replace(/\/+$/, '');
  } catch (cause) {
    throw new ZAIClientError('invalid-input', 'baseUrl must be an HTTP(S) API root, including /v8.', {cause});
  }
  // Generated resource signatures carry the schema types. This internal dynamic
  // adapter only handles the already-typed HTTP operation and raw response body.
  const client = createClient({baseUrl}) as unknown as DynamicOpenAPIClient;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new ZAIClientError('invalid-input', 'A fetch implementation is required.');

  return {
    async request<T>(input: ZAIOperationRequest): Promise<T> {
      const {signal} = input.options ?? {};
      if (signal?.aborted) throw aborted(signal);
      let body: string | FormData | undefined;
      let headers: Headers;
      try {
        for (const [key, value] of Object.entries(input.pathParams ?? {})) {
          // URL parsers normalize literal dot segments, even when percent-encoded.
          if (typeof value !== 'string' || !value.trim() || value === '.' || value === '..') throw new Error(`Invalid path parameter: ${key}`);
        }
        body = serializeBody(input);
        headers = new Headers(options.headers);
        new Headers(input.options?.headers).forEach((value, key) => headers.set(key, value));
        headers.delete('content-type');
        if (typeof body === 'string') headers.set('content-type', 'application/json');
        headers.set('accept', input.responseType === 'stream' ? 'text/event-stream' : input.responseType === 'blob' ? 'application/octet-stream' : 'application/json');
      } catch (cause) {
        if (cause instanceof ZAIClientError) throw cause;
        throw new ZAIClientError('invalid-input', 'Unable to construct the request.', {cause});
      }
      const token = await waitForToken(options.getToken, signal);
      try {
        headers.set('authorization', `Bearer ${token}`);
      } catch (cause) {
        throw new ZAIClientError('authentication', 'The token cannot be used as an authorization header.', {cause});
      }
      let received: Response | undefined;
      try {
        const result = await client.request(input.method, input.path, {
          params: {path: input.pathParams, query: input.query}, body,
          bodySerializer: (value: unknown) => value as BodyInit,
          pathSerializer: (path: string, params: Record<string, unknown>) => path.replace(/\{([^}]+)\}/g, (_, key: string) => encodeURIComponent(String(params[key]))),
          querySerializer: (query: Record<string, unknown>) => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== null) params.append(key, String(value));
            return params.toString();
          },
          signal, headers, parseAs: 'stream',
          fetch: async (request: Request) => {
            if (signal?.aborted) throw aborted(signal);
            try {
              received = await fetchImpl(request);
            } catch (cause) {
              if (signal?.aborted) throw aborted(signal);
              throw new ZAIClientError('network', 'Unable to reach the ZAI server.', {cause});
            }
            if (!received.ok) {
              const text = await received.text();
              let errorBody: unknown = text;
              try {errorBody = JSON.parse(text);} catch { /* Preserve non-JSON errors. */ }
              throw new ZAIClientError(received.status === 401 || received.status === 403 ? 'authentication' : 'http', errorMessage(errorBody, received.status), {
                status: received.status, body: errorBody, headers: received.headers, method: input.method.toUpperCase(), path: input.path,
              });
            }
            return received;
          },
        });
        const response = result.response;
        if (!(input.successStatuses ?? [200, 201]).includes(response.status)) {
          discardResponse(response);
          throw new ZAIClientError('invalid-response', 'Unexpected success status.', {status: response.status});
        }
        if (signal?.aborted) {
          discardResponse(response);
          throw aborted(signal);
        }
        if (input.responseType === 'stream') return response as T;
        if (input.responseType === 'blob') {
          if (!response.body) throw new ZAIClientError('invalid-response', 'The file response has no body.');
          return await response.blob() as T;
        }
        const mediaType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
        if (mediaType !== 'application/json' && !mediaType?.endsWith('+json')) {
          discardResponse(response);
          throw new ZAIClientError('invalid-response', 'Expected a JSON response.', {status: response.status});
        }
        const text = await response.text();
        try {return JSON.parse(text) as T;} catch (cause) {
          throw new ZAIClientError('invalid-response', 'The response is not valid JSON.', {cause, status: response.status, body: text});
        }
      } catch (cause) {
        if (signal?.aborted) throw aborted(signal);
        if (cause instanceof ZAIClientError) throw cause;
        throw new ZAIClientError(received ? 'network' : 'invalid-input', received ? 'Unable to read the response.' : 'Unable to construct the request.', {
          cause, status: received?.status, headers: received?.headers, method: input.method.toUpperCase(), path: input.path,
        });
      }
    },
  };
}
