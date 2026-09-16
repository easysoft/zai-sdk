/** Stable error categories; applications should branch on code instead of message. */
export type ZAIErrorCode = 'authentication' | 'http' | 'network' | 'aborted' | 'invalid-input' | 'invalid-response';

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
  readonly method?: string;
  readonly path?: string;
  readonly headers?: Headers;

  constructor(code: ZAIErrorCode, message: string, options: ZAIErrorOptions = {}) {
    super(message, {cause: options.cause});
    this.name = 'ZAIClientError';
    this.code = code;
    this.status = options.status;
    this.body = options.body;
    this.method = options.method;
    this.path = options.path;
    this.headers = options.headers;
  }
}
