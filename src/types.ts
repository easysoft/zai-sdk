export interface ZAIRequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface CreateZAIClientOptions {
  /** API root including /v8. Relative URLs are supported in browsers. */
  baseUrl: string;
  /** Called for every request; use createZAITokenProvider to cache and renew tokens. */
  getToken: () => string | Promise<string>;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
}

/** A Blob (including File), or an explicitly named Blob for multipart uploads. */
export type ZAIUploadFile = Blob | {blob: Blob; filename: string};

/** Internal boundary shared by generated resource methods and the transport. */
export interface ZAIOperationRequest {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  pathParams?: Record<string, string>;
  query?: object;
  body?: unknown;
  encoding?: 'json' | 'multipart' | 'bundle';
  responseType?: 'json' | 'blob' | 'stream';
  successStatuses?: readonly number[];
  options?: ZAIRequestOptions;
}

export interface ZAITransport {
  request<T>(input: ZAIOperationRequest): Promise<T>;
}
