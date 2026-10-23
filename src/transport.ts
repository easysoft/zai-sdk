import createClient from 'openapi-fetch';
import {ZAIClientError} from './errors.js';
import {createAuthError, sanitizeAuthError} from './auth-errors.js';
import {createZAITokenProvider} from './auth.js';
import type {CreateZAIClientOptions, ZAIAuthContext, ZAIOperationRequest, ZAITransport, ZAIUploadFile} from './types.js';

interface DynamicOpenAPIClient {
  request(method: ZAIOperationRequest['method'], path: string, init: {
    params: {path?: Record<string, string>; query?: object};
    body?: string | FormData | Blob;
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
async function waitForToken(getToken: (context: ZAIAuthContext) => string | Promise<string>, context: ZAIAuthContext): Promise<string> {
  const {signal} = context;
  if (signal?.aborted) throw aborted(signal);
  const pending = Promise.resolve().then(() => {
    if (signal?.aborted) throw aborted(signal);
    return getToken(context);
  });
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
      throw createAuthError('authentication', 'The token provider returned an empty token.');
    }
    if (signal?.aborted) throw aborted(signal);
    return token;
  } catch (cause) {
    if (signal?.aborted) throw aborted(signal);
    throw sanitizeAuthError(cause, 'Unable to obtain an authentication token.');
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

function serializeBody(input: ZAIOperationRequest): string | FormData | Blob | undefined {
  const {body, encoding} = input;
  if (body === undefined) return undefined;
  if (encoding === 'binary') {
    if (!isBlob(body)) throw new ZAIClientError('invalid-input', 'Binary uploads require a Blob or File.');
    return body;
  }
  if (encoding === 'multipart' || encoding === 'file' || (encoding === 'bundle' && typeof body === 'object' && body !== null && 'bundle' in body)) {
    if (typeof body !== 'object' || body === null) throw new ZAIClientError('invalid-input', 'A multipart body is required.');
    const values = body as Record<string, unknown>;
    const form = new FormData();
    if (encoding === 'multipart') {
      if (values.path !== undefined && (typeof values.path !== 'string' || !values.path.trim())) {
        throw new ZAIClientError('invalid-input', 'An upload target path must be a non-empty string when provided.');
      }
      appendFile(form, 'file', values.file as ZAIUploadFile);
      if (values.path !== undefined) form.append('path', values.path as string);
    } else if (encoding === 'file') {
      // The extraction schema leaves file optional. Preserve that contract;
      // reject invalid supplied files, but let the server report missing files.
      if (values.file !== undefined) appendFile(form, 'file', values.file as ZAIUploadFile);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateFileSelector(value: unknown): void {
  if (!isRecord(value) || Object.keys(value).some(key => key !== 'path' && key !== 'file_id')
    || (value.path !== undefined) === (value.file_id !== undefined)
    || (value.path !== undefined && (typeof value.path !== 'string' || value.path.length < 1 || value.path.length > 4096))
    || (value.file_id !== undefined && (typeof value.file_id !== 'string' || !value.file_id.trim()))) {
    throw new ZAIClientError('invalid-input', 'Provide exactly one non-empty path or file_id.');
  }
}

function validateJSONBody(body: string | FormData | Blob | undefined, validation: 'file-body' | 'tool-result'): void {
  const value: unknown = typeof body === 'string' ? JSON.parse(body) : undefined;
  if (validation === 'file-body') {
    validateFileSelector(value);
    return;
  }
  if (!isRecord(value) || Object.keys(value).length !== 1 || (!Object.hasOwn(value, 'output') && !Object.hasOwn(value, 'error'))) {
    throw new ZAIClientError('invalid-input', 'A tool result must serialize exactly one output or error field.');
  }
  if (Object.hasOwn(value, 'error') && (!isRecord(value.error)
    || typeof value.error.code !== 'string' || typeof value.error.message !== 'string'
    || Object.keys(value.error).some(key => key !== 'code' && key !== 'message'))) {
    throw new ZAIClientError('invalid-input', 'A tool error requires string code and message fields.');
  }
}

function selectTokenType(input: ZAIOperationRequest, automatic: boolean): 'admin' | 'user' {
  const selected = input.options?.tokenType;
  if ((input.auth !== undefined && !['admin', 'user', 'user-only'].includes(input.auth))
    || (automatic && input.auth === undefined)
    || (selected !== undefined && selected !== 'admin' && selected !== 'user')
    || (input.auth === 'admin' && selected === 'user')
    || (input.auth === 'user-only' && selected === 'admin')) {
    throw new ZAIClientError('invalid-input', 'The selected token type is not permitted for this operation.');
  }
  return selected ?? (input.auth === 'admin' ? 'admin' : 'user');
}

function setIdempotencyKey(headers: Headers, input: ZAIOperationRequest): void {
  const explicit = input.options?.idempotencyKey;
  if (explicit !== undefined && typeof explicit !== 'string') {
    throw new ZAIClientError('invalid-input', 'An idempotency key must contain 1 to 128 characters.');
  }
  let key = explicit ?? headers.get('idempotency-key');
  if (key == null && input.idempotencyRequired) {
    key = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  if (explicit !== undefined || key !== null) {
    if (typeof key !== 'string' || !key.trim() || key.length > 128) {
      throw new ZAIClientError('invalid-input', 'An idempotency key must contain 1 to 128 characters.');
    }
    headers.set('idempotency-key', key);
  }
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
  if (!options || typeof options.baseUrl !== 'string' || !options.baseUrl.trim()
    || (options.getToken !== undefined) === (options.auth !== undefined)
    || (options.getToken !== undefined && typeof options.getToken !== 'function')
    || (options.auth !== undefined && (!options.auth || options.auth.mode !== 'auto'))) {
    throw new ZAIClientError('invalid-input', 'baseUrl and exactly one of getToken or auth.mode=auto are required.');
  }
  let baseUrl: string;
  try {
    const url = new URL(options.baseUrl, globalThis.location?.href);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid API root');
    baseUrl = url.href.replace(/\/+$/, '');
  } catch (cause) {
    throw new ZAIClientError('invalid-input', 'baseUrl must be an HTTP(S) API root, including /v1/zai.', {cause});
  }
  const allowed = options.allowedTokenTypes;
  if (allowed !== undefined && (!Array.isArray(allowed) || !allowed.length
    || Array.from(allowed).some(value => value !== 'admin' && value !== 'user'))) {
    throw new ZAIClientError('invalid-input', 'allowedTokenTypes must be a non-empty array containing only admin or user.');
  }
  const allowedTokenTypes = new Set(allowed ?? ['admin', 'user']);
  const configuredIdentity = options.auth ?? options.identity;
  if ((options.auth !== undefined && options.identity !== undefined)
    || (configuredIdentity !== undefined && (!configuredIdentity || typeof configuredIdentity !== 'object'
      || [configuredIdentity.appID, configuredIdentity.userID].some(value => typeof value !== 'string' || !value.length)))) {
    throw new ZAIClientError('invalid-input', 'Provide a non-empty appID and userID as identity only with custom getToken.');
  }
  const identity = configuredIdentity === undefined ? undefined
    : Object.freeze({appID: configuredIdentity.appID, userID: configuredIdentity.userID});
  // Generated resource signatures carry the schema types. This internal dynamic
  // adapter only handles the already-typed HTTP operation and raw response body.
  const client = createClient({baseUrl}) as unknown as DynamicOpenAPIClient;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new ZAIClientError('invalid-input', 'A fetch implementation is required.');
  const auth = options.auth;
  const credentials = auth && {appID: auth.appID, appKey: auth.appKey, userID: auth.userID, userName: auth.userName};
  const providerOptions = auth && {credentials: credentials!, expiresInSeconds: auth.expiresInSeconds, refreshBeforeSeconds: auth.refreshBeforeSeconds};
  const providers = providerOptions && {
    admin: createZAITokenProvider({...providerOptions, tokenType: 'admin'}),
    user: createZAITokenProvider({...providerOptions, tokenType: 'user', baseUrl, fetch: fetchImpl,
      headers: options.headers, signingSecretTimeoutMs: auth!.signingSecretTimeoutMs}),
  };
  const fixedToken = options.getToken;

  return {
    auth: providers ? {
      invalidate(options) {providers.admin.invalidate(options); providers.user.invalidate(options);},
      dispose() {providers.admin.dispose(); providers.user.dispose();},
    } : undefined,
    async request<T>(input: ZAIOperationRequest): Promise<T> {
      const {signal} = input.options ?? {};
      if (signal?.aborted) throw aborted(signal);
      const tokenType = selectTokenType(input, !!providers);
      if (!allowedTokenTypes.has(tokenType)) {
        throw new ZAIClientError('invalid-input', 'The selected token type is not allowed by this client.');
      }
      let body: string | FormData | Blob | undefined;
      let headers: Headers;
      try {
        for (const [key, value] of Object.entries(input.pathParams ?? {})) {
          // URL parsers normalize literal dot segments, even when percent-encoded.
          if (typeof value !== 'string' || !value.trim() || value === '.' || value === '..') throw new Error(`Invalid path parameter: ${key}`);
        }
        if (input.validation === 'file-query') validateFileSelector(input.query);
        if (input.validation === 'user-scope') {
          const externalUserId = isRecord(input.query) ? input.query.external_user_id : undefined;
          if (tokenType === 'admin'
            ? typeof externalUserId !== 'string' || !externalUserId.trim() || externalUserId.length > 128
            : externalUserId !== undefined) {
            throw new ZAIClientError('invalid-input', 'Administrator requests require external_user_id; user requests cannot override it.');
          }
        }
        body = serializeBody(input);
        if (input.validation === 'file-body' || input.validation === 'tool-result') validateJSONBody(body, input.validation);
        headers = new Headers(options.headers);
        new Headers(input.options?.headers).forEach((value, key) => headers.set(key, value));
        setIdempotencyKey(headers, input);
        headers.delete('content-type');
        if (input.encoding === 'binary') headers.set('content-type', 'application/octet-stream');
        else if (typeof body === 'string') headers.set('content-type', 'application/json');
        headers.set('accept', input.responseType === 'stream' ? 'text/event-stream' : input.responseType === 'blob' ? 'application/octet-stream' : 'application/json');
      } catch (cause) {
        if (cause instanceof ZAIClientError) throw cause;
        throw new ZAIClientError('invalid-input', 'Unable to construct the request.', {cause});
      }
      const getToken = providers ? providers[tokenType] : fixedToken!;
      const context: ZAIAuthContext = Object.freeze({
        purpose: tokenType, baseUrl, method: input.method.toUpperCase() as ZAIAuthContext['method'], path: input.path,
        ...(identity ? {identity} : {}), ...(signal ? {signal} : {}),
      });
      const token = await waitForToken(getToken, context);
      try {
        headers.set('authorization', `Bearer ${token}`);
      } catch {
        throw createAuthError('authentication', 'The token cannot be used as an authorization header.');
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
