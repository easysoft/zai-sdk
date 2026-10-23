export interface ZAIRequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
  /** Override the default token selection when the operation permits it. */
  tokenType?: 'admin' | 'user';
  /** Reuse this key when retrying the same write. Required operations generate one when omitted. */
  idempotencyKey?: string;
}

import type {ZAICredentials, ZAITokenProvider} from './auth.js';

/** Server-side credentials used to select ak/ek before each operation. */
export interface ZAIAutoAuthOptions extends ZAICredentials {
  mode: 'auto';
  expiresInSeconds?: number;
  refreshBeforeSeconds?: number;
  signingSecretTimeoutMs?: number;
}

export type CreateZAIClientOptions = {
  /** API root including /v1/zai. Relative URLs are supported in browsers. */
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
  /** Limit business-request token purposes. Defaults to both; shared operations still default to user. */
  allowedTokenTypes?: readonly ('admin' | 'user')[];
} & (
  | {
    /** Called before each request: true selects ak; false selects ek. Return the token without Bearer. */
    getToken: (admin: boolean) => string | Promise<string>;
    auth?: never;
  }
  | {auth: ZAIAutoAuthOptions; getToken?: never}
);

/** user permits either token; user-only requires ek. Both default to ek. */
export type ZAIOperationAuth = 'admin' | 'user' | 'user-only';

/** A Blob (including File), or an explicitly named Blob for multipart uploads. */
export type ZAIUploadFile = Blob | {blob: Blob; filename: string};

/** Internal boundary shared by generated resource methods and the transport. */
export interface ZAIOperationRequest {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  pathParams?: Record<string, string>;
  query?: object;
  body?: unknown;
  encoding?: 'json' | 'multipart' | 'file' | 'bundle' | 'binary';
  auth?: ZAIOperationAuth;
  idempotencyRequired?: boolean;
  validation?: 'file-query' | 'file-body' | 'tool-result' | 'user-scope';
  responseType?: 'json' | 'blob' | 'stream';
  successStatuses?: readonly number[];
  options?: ZAIRequestOptions;
}

export interface ZAITransport {
  /** SDK-owned authentication lifecycle; custom getToken sources remain caller-owned. */
  auth: Pick<ZAITokenProvider, 'invalidate' | 'dispose'> | undefined;
  request<T>(input: ZAIOperationRequest): Promise<T>;
}
