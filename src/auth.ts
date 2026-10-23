import {md5} from '@noble/hashes/legacy.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import {ZAIClientError} from './errors.js';
import {createTransport} from './transport.js';

export interface ZAICredentials {
  appID: string;
  appKey: string;
  userID: string;
  userName?: string;
}

/** Token expiration is a Unix timestamp in seconds, not milliseconds. */
export interface ZAIToken {
  token: string;
  expiresAt: number;
}

export interface ZAITokenProvider {
  (): Promise<string>;
  /** Clear the token and cancel pending acquisition; optionally also clear the signing secret. */
  invalidate(options?: {signingSecret?: boolean}): void;
  /** Clear cached tokens and signing secrets and permanently stop token acquisition. */
  dispose(): void;
}

export type ZAITokenProviderOptions = {
  /** Renew before a request when this many seconds (or less) remain. Default: 60. */
  refreshBeforeSeconds?: number;
} & (
  | {
    credentials: ZAICredentials;
    /** Lifetime of a locally signed token in seconds. Default: 1000. */
    expiresInSeconds?: number;
    fetchToken?: never;
  } & (
    | {tokenType?: 'admin'; baseUrl?: never; fetch?: never; headers?: never; signingSecretTimeoutMs?: never}
    | {
      tokenType: 'user';
      /** API root including /v1/zai, used to retrieve this app's signing secret. */
      baseUrl: string;
      fetch?: typeof globalThis.fetch;
      headers?: HeadersInit;
      /** Independent timeout for the shared signing-secret request. Default: 30000. */
      signingSecretTimeoutMs?: number;
    }
  )
  | {
    fetchToken: () => ZAIToken | Promise<ZAIToken>;
    credentials?: never;
    expiresInSeconds?: never;
    tokenType?: never;
    baseUrl?: never;
    fetch?: never;
    headers?: never;
    signingSecretTimeoutMs?: never;
  }
);

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

function validateCredentials(credentials: ZAICredentials): void {
  if (!credentials || typeof credentials !== 'object'
    || [credentials.appID, credentials.appKey, credentials.userID].some(value => typeof value !== 'string' || value.length === 0)) {
    throw new ZAIClientError('invalid-input', 'appID, appKey and userID must be non-empty strings.');
  }
  if (credentials.userName !== undefined && typeof credentials.userName !== 'string') {
    throw new ZAIClientError('invalid-input', 'userName must be a string when provided.');
  }
}

function validSeconds(value: number, minimum: number): boolean {
  return Number.isSafeInteger(value) && value >= minimum;
}

function signToken(
  prefix: 'ak-' | 'ek-',
  appID: string,
  signingKey: string,
  userID: string,
  expiredTime: number,
  userName?: string,
): string {
  if (!validSeconds(expiredTime, 0)) {
    throw new ZAIClientError('invalid-input', 'expiredTime must be a non-negative integer Unix timestamp in seconds.');
  }
  const payload = {
    hash: bytesToHex(md5(new TextEncoder().encode(signingKey + appID + userID + expiredTime))),
    app_id: appID,
    user_id: userID,
    expired_time: expiredTime,
    ...(userName === undefined ? {} : {user_name: userName}),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return prefix + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
}

/** Sign an administrator token using the application's API key and UTF-8 JSON/Base64. */
export function createZAIToken(
  appID: string,
  appKey: string,
  userID: string,
  expiredTime = nowSeconds() + 1000,
  userName?: string,
): string {
  validateCredentials({appID, appKey, userID, userName});
  return signToken('ak-', appID, appKey, userID, expiredTime, userName);
}

/**
 * Cache and renew tokens on demand, sharing renewal between concurrent callers.
 * There are no background renewal timers. Share this provider between clients only when they use
 * the same identity. Browser applications should use fetchToken from a backend.
 */
export function createZAITokenProvider(options: ZAITokenProviderOptions): ZAITokenProvider {
  if (!options || typeof options !== 'object') {
    throw new ZAIClientError('invalid-input', 'Token provider options are required.');
  }
  const refreshBeforeSeconds = options.refreshBeforeSeconds ?? 60;
  if (!validSeconds(refreshBeforeSeconds, 0)) {
    throw new ZAIClientError('invalid-input', 'refreshBeforeSeconds must be a non-negative integer.');
  }
  const hasCredentials = options.credentials !== undefined;
  const hasFetcher = options.fetchToken !== undefined;
  if (hasCredentials === hasFetcher) {
    throw new ZAIClientError('invalid-input', 'Provide exactly one of credentials or fetchToken.');
  }

  let acquire: (signal: AbortSignal) => ZAIToken | Promise<ZAIToken>;
  let clearSecret: (() => void) | undefined;
  let disposeSource: (() => void) | undefined;
  let timeoutMs: number | undefined;
  if (hasCredentials) {
    const credentials = options.credentials as ZAICredentials;
    validateCredentials(credentials);
    const {appID, appKey, userID, userName} = credentials;
    const expiresInSeconds = options.expiresInSeconds ?? 1000;
    if (!validSeconds(expiresInSeconds, 1)) {
      throw new ZAIClientError('invalid-input', 'expiresInSeconds must be a positive integer.');
    }
    if (options.tokenType !== undefined && options.tokenType !== 'admin' && options.tokenType !== 'user') {
      throw new ZAIClientError('invalid-input', 'tokenType must be admin or user.');
    }
    if (options.tokenType === 'user') {
      timeoutMs = options.signingSecretTimeoutMs ?? 30_000;
      if (!validSeconds(timeoutMs, 1) || timeoutMs > 2_147_483_647) {
        throw new ZAIClientError('invalid-input', 'signingSecretTimeoutMs must be a positive integer no greater than 2147483647.');
      }
      let headers: Headers;
      try {headers = new Headers(options.headers);} catch {
        throw new ZAIClientError('invalid-input', 'Invalid signing-secret request headers.');
      }
      // A fixed administrator provider prevents auto-auth recursion in the transport.
      const adminProvider = createZAITokenProvider({credentials: {appID, appKey, userID, userName}, expiresInSeconds, refreshBeforeSeconds});
      const transport = createTransport({
        baseUrl: options.baseUrl,
        getToken: adminProvider,
        fetch: options.fetch,
        headers,
      });
      let signingSecret: string | undefined;
      clearSecret = () => {signingSecret = undefined; adminProvider.invalidate();};
      disposeSource = () => adminProvider.dispose();
      acquire = async signal => {
        if (signingSecret === undefined) {
          try {
            const result = await transport.request<unknown>({method: 'get', path: '/signing_secret', successStatuses: [200], options: {signal}});
            signal.throwIfAborted();
            if (!result || typeof result !== 'object' || !('app_id' in result) || result.app_id !== appID
              || !('signing_secret' in result) || typeof result.signing_secret !== 'string' || !result.signing_secret.trim()
              || !('token_prefix' in result) || result.token_prefix !== 'ek-') {
              throw new ZAIClientError('authentication', 'The signing-secret response does not match the app and user-token protocol.');
            }
            signingSecret = result.signing_secret;
          } catch (cause) {
            if (signal.aborted) throw signal.reason;
            // The response and custom fetch errors can contain key material. Keep
            // only safe transport metadata, never the original body or cause.
            throw new ZAIClientError(cause instanceof ZAIClientError ? cause.code : 'authentication',
              'Unable to obtain the app signing secret.',
              {status: cause instanceof ZAIClientError ? cause.status : undefined, method: 'GET', path: '/signing_secret'});
          }
        }
        // Slow secret retrieval must not consume the new user token's lifetime.
        const expiresAt = nowSeconds() + expiresInSeconds;
        return {token: signToken('ek-', appID, signingSecret, userID, expiresAt, userName), expiresAt};
      };
    } else {
      if (options.baseUrl !== undefined || options.fetch !== undefined || options.headers !== undefined || options.signingSecretTimeoutMs !== undefined) {
        throw new ZAIClientError('invalid-input', 'Signing-secret request options apply only to user tokens.');
      }
      acquire = () => {
        const expiresAt = nowSeconds() + expiresInSeconds;
        return {token: createZAIToken(appID, appKey, userID, expiresAt, userName), expiresAt};
      };
    }
  } else {
    if (typeof options.fetchToken !== 'function' || options.expiresInSeconds !== undefined || options.tokenType !== undefined
      || options.baseUrl !== undefined || options.fetch !== undefined || options.headers !== undefined || options.signingSecretTimeoutMs !== undefined) {
      throw new ZAIClientError('invalid-input', 'fetchToken must be a function and cannot be combined with local signing options.');
    }
    acquire = options.fetchToken;
  }

  let cached: ZAIToken | undefined;
  let pending: {promise: Promise<string>; controller: AbortController} | undefined;
  let disposed = false;
  const getToken = () => {
    if (disposed) return Promise.reject(new ZAIClientError('aborted', 'The token provider has been disposed.'));
    if (pending) return pending.promise;
    if (cached && cached.expiresAt - nowSeconds() > refreshBeforeSeconds) {
      return Promise.resolve(cached.token);
    }
    const controller = new AbortController();
    const {signal} = controller;
    let cancel!: () => void;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interrupted = new Promise<never>((_, reject) => {
      cancel = () => reject(signal.reason);
      signal.addEventListener('abort', cancel, {once: true});
    });
    const acquisition = Promise.resolve().then(async () => {
      signal.throwIfAborted();
      let result: ZAIToken;
      try {
        result = await acquire(signal);
      } catch (cause) {
        if (signal.aborted) throw signal.reason;
        if (cause instanceof ZAIClientError && (hasCredentials || cause.code === 'invalid-input')) throw cause;
        throw new ZAIClientError('authentication', 'Failed to acquire a ZAI token.', {cause});
      }
      signal.throwIfAborted();
      if (!result || typeof result.token !== 'string' || result.token.trim().length === 0
        || !validSeconds(result.expiresAt, 0) || result.expiresAt <= nowSeconds()) {
        throw new ZAIClientError('authentication', 'Token source must return a non-empty token with a future integer expiresAt in Unix seconds.');
      }
      // Snapshot the result: later mutation by the fetcher cannot alter our cache.
      cached = {token: result.token, expiresAt: result.expiresAt};
      return cached.token;
    });
    const promise = Promise.race([acquisition, interrupted]).finally(() => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      if (pending?.controller === controller) pending = undefined;
    });
    pending = {promise, controller};
    if (timeoutMs !== undefined) {
      timer = setTimeout(() => controller.abort(new ZAIClientError('authentication', 'Signing-secret request timed out.',
        {method: 'GET', path: '/signing_secret'})), timeoutMs);
    }
    return promise;
  };

  const invalidate = (options?: {signingSecret?: boolean}): void => {
    if (options !== undefined && (!options || typeof options !== 'object'
      || (options.signingSecret !== undefined && typeof options.signingSecret !== 'boolean'))) {
      throw new ZAIClientError('invalid-input', 'signingSecret must be a boolean when provided.');
    }
    cached = undefined;
    const previous = pending;
    pending = undefined;
    if (options?.signingSecret) clearSecret?.();
    previous?.controller.abort(new ZAIClientError('aborted', disposed ? 'The token provider has been disposed.' : 'The token provider was invalidated.'));
  };
  return Object.assign(getToken, {invalidate, dispose() {
    if (disposed) return;
    disposed = true;
    invalidate({signingSecret: true});
    disposeSource?.();
  }});
}
