/** Stable error categories; applications should branch on code instead of message. */
export type ZAIErrorCode = 'authentication' | 'http' | 'network' | 'aborted' | 'invalid-input' | 'invalid-response';

/** Additive server diagnostics; code is distinct from the client's error category. */
export interface ZAIErrorInfo {
  code: string;
  message: string;
  reason_code: string;
  user_message: string;
  retryable?: boolean;
  details: Record<string, unknown>;
}

function errorInfo(body: unknown): ZAIErrorInfo | undefined {
  if (!body || typeof body !== 'object' || !('error_info' in body)) return undefined;
  const info = body.error_info;
  if (!info || typeof info !== 'object' || Array.isArray(info)) return undefined;
  const fields = info as Record<string, unknown>;
  if (!['code', 'message', 'reason_code', 'user_message'].every(key => typeof fields[key] === 'string')
    || !fields.details || typeof fields.details !== 'object' || Array.isArray(fields.details)
    || (fields.retryable !== undefined && typeof fields.retryable !== 'boolean')) return undefined;
  return info as ZAIErrorInfo;
}

export interface ZAIErrorOptions {
  cause?: unknown;
  status?: number;
  body?: unknown;
  method?: string;
  path?: string;
  headers?: Headers;
}

/** A transport or authentication error. Request credentials are never attached. */
export class ZAIClientError extends Error {
  readonly code: ZAIErrorCode;
  readonly status?: number;
  readonly body?: unknown;
  readonly errorInfo?: ZAIErrorInfo;
  readonly method?: string;
  readonly path?: string;
  readonly headers?: Headers;

  constructor(code: ZAIErrorCode, message: string, options: ZAIErrorOptions = {}) {
    super(message, {cause: options.cause});
    this.name = 'ZAIClientError';
    this.code = code;
    this.status = options.status;
    this.body = options.body;
    this.errorInfo = errorInfo(options.body);
    this.method = options.method;
    this.path = options.path;
    this.headers = options.headers;
  }
}
