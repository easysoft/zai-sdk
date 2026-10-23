import {md5} from '@noble/hashes/legacy.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import {ZAIClientError} from './errors.js';
import {createTransport} from './transport.js';

export interface ZAIIdentity {
  appID: string;
  userID: string;
}

/** Shared provider acquisition metadata, independent of any one business request. */
export interface ZAITokenAcquisitionContext {
  readonly signal: AbortSignal;
  /** initial until first success; refresh thereafter; invalidated after explicit invalidation until success. */
  readonly reason: 'initial' | 'refresh' | 'invalidated';
}

export interface ZAICredentials extends ZAIIdentity {
  appKey: string;
  userName?: string;
  signingSecret?: never;
  getSigningSecret?: never;
}

/** Trusted backend credentials that can sign user tokens without an application API key. */
export type ZAIUserCredentials = ZAIIdentity & {userName?: string; appKey?: never} & (
  | {signingSecret: string; getSigningSecret?: never}
  | {getSigningSecret: (context: ZAITokenAcquisitionContext) => string | Promise<string>; signingSecret?: never}
);

export interface ZAIUserTokenOptions extends ZAIIdentity {
  signingSecret: string;
  userName?: string;
  /** Future Unix timestamp in seconds. Default: now + 1000. */
  expiresAt?: number;
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
    /** Lifetime of a locally signed token in seconds. Default: 1000. */
    expiresInSeconds?: number;
    fetchToken?: never;
    acquireTimeoutMs?: never;
  } & (
    | {credentials: ZAICredentials; tokenType?: 'admin'; baseUrl?: never; fetch?: never; headers?: never; signingSecretTimeoutMs?: never}
    | {
      credentials: ZAICredentials;
      tokenType: 'user';
      /** API root including /v1/zai, used to retrieve this app's signing secret. */
      baseUrl: string;
      fetch?: typeof globalThis.fetch;
      headers?: HeadersInit;
      /** Independent timeout for the shared signing-secret request. Default: 30000. */
      signingSecretTimeoutMs?: number;
    }
    | {
      credentials: ZAIUserCredentials;
      tokenType: 'user';
      baseUrl?: never;
      fetch?: never;
      headers?: never;
      signingSecretTimeoutMs?: number;
    }
  )
  | {
    /** The shared acquisition owns context.signal; pass it to the backend fetch. */
    fetchToken: (context: ZAITokenAcquisitionContext) => ZAIToken | Promise<ZAIToken>;
    /** Independent timeout for shared external token acquisition. Default: 30000. */
    acquireTimeoutMs?: number;
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

function validateIdentity(credentials: ZAIIdentity & {userName?: string}): void {
  if (!credentials || typeof credentials !== 'object'
    || [credentials.appID, credentials.userID].some(value => typeof value !== 'string' || value.length === 0)) {
    throw new ZAIClientError('invalid-input', 'appID and userID must be non-empty strings.');
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
  validateIdentity({appID, userID, userName});
  if (typeof appKey !== 'string' || !appKey.length) {
    throw new ZAIClientError('invalid-input', 'appKey must be a non-empty string.');
  }
  return signToken('ak-', appID, appKey, userID, expiredTime, userName);
}

/** Sign an external-user token locally. Keep the signing secret in a trusted backend. */
export function createZAIUserToken(options: ZAIUserTokenOptions): string {
  validateIdentity(options);
  if (typeof options.signingSecret !== 'string' || !options.signingSecret.trim()) {
    throw new ZAIClientError('invalid-input', 'signingSecret must be a non-empty string.');
  }
  const expiresAt = options.expiresAt === undefined ? nowSeconds() + 1000 : options.expiresAt;
  if (!validSeconds(expiresAt, 0) || expiresAt <= nowSeconds()) {
    throw new ZAIClientError('invalid-input', 'expiresAt must be a future integer Unix timestamp in seconds.');
  }
  return signToken('ek-', options.appID, options.signingSecret, options.userID, expiresAt, options.userName);
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

  let acquire: (context: ZAITokenAcquisitionContext) => ZAIToken | Promise<ZAIToken>;
  let clearSecret: (() => void) | undefined;
  let disposeSource: (() => void) | undefined;
  let timeoutMs: number | undefined;
  let secretRequest = false;
  if (hasCredentials) {
    if (options.acquireTimeoutMs !== undefined) {
      throw new ZAIClientError('invalid-input', 'acquireTimeoutMs applies only to fetchToken.');
    }
    const credentials = options.credentials as ZAICredentials | ZAIUserCredentials;
    validateIdentity(credentials);
    const {appID, appKey, userID, userName, signingSecret: configuredSecret, getSigningSecret} = credentials;
    if ([appKey, configuredSecret, getSigningSecret].filter(value => value !== undefined).length !== 1
      || (appKey !== undefined && (typeof appKey !== 'string' || !appKey.length))
      || (configuredSecret !== undefined && (typeof configuredSecret !== 'string' || !configuredSecret.trim()))
      || (getSigningSecret !== undefined && typeof getSigningSecret !== 'function')) {
      throw new ZAIClientError('invalid-input', 'Provide exactly one non-empty appKey, signingSecret, or getSigningSecret function.');
    }
    if (appKey === undefined && (options.tokenType !== 'user' || options.baseUrl !== undefined || options.fetch !== undefined || options.headers !== undefined)) {
      throw new ZAIClientError('invalid-input', 'Direct signing-secret credentials require user tokens and cannot use HTTP signing-secret options.');
    }
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
      let loadSecret: (context: ZAITokenAcquisitionContext) => string | Promise<string>;
      let invalidateSource: (() => void) | undefined;
      if (appKey !== undefined) {
        secretRequest = true;
        let headers: Headers;
        try {headers = new Headers(options.headers);} catch {
          throw new ZAIClientError('invalid-input', 'Invalid signing-secret request headers.');
        }
        // A fixed administrator provider prevents auto-auth recursion in the transport.
        const adminProvider = createZAITokenProvider({credentials: {appID, appKey, userID, userName}, expiresInSeconds, refreshBeforeSeconds});
        const transport = createTransport({baseUrl: options.baseUrl!, getToken: adminProvider, fetch: options.fetch, headers});
        invalidateSource = () => adminProvider.invalidate();
        disposeSource = () => adminProvider.dispose();
        loadSecret = async ({signal}) => {
          const result = await transport.request<unknown>({method: 'get', path: '/signing_secret', successStatuses: [200], options: {signal}});
          if (!result || typeof result !== 'object' || !('app_id' in result) || result.app_id !== appID
            || !('signing_secret' in result) || typeof result.signing_secret !== 'string' || !result.signing_secret.trim()
            || !('token_prefix' in result) || result.token_prefix !== 'ek-') {
            throw new ZAIClientError('authentication', 'The signing-secret response does not match the app and user-token protocol.');
          }
          return result.signing_secret;
        };
      } else {
        loadSecret = getSigningSecret ?? (() => configuredSecret!);
      }
      let signingSecret: string | undefined;
      clearSecret = () => {signingSecret = undefined; invalidateSource?.();};
      acquire = async context => {
        const {signal} = context;
        if (signingSecret === undefined) {
          try {
            const result = await loadSecret(context);
            signal.throwIfAborted();
            if (typeof result !== 'string' || !result.trim()) {
              throw new ZAIClientError('authentication', 'The signing-secret source returned an invalid secret.');
            }
            signingSecret = result;
          } catch (cause) {
            if (signal.aborted) throw signal.reason;
            // The response and custom fetch errors can contain key material. Keep
            // only safe transport metadata, never the original body or cause.
            const transportError = secretRequest && cause instanceof ZAIClientError ? cause : undefined;
            throw new ZAIClientError(transportError?.code ?? 'authentication',
              'Unable to obtain the app signing secret.',
              {status: transportError?.status, ...(secretRequest ? {method: 'GET', path: '/signing_secret'} : {})});
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
        return {token: createZAIToken(appID, appKey!, userID, expiresAt, userName), expiresAt};
      };
    }
  } else {
    if (typeof options.fetchToken !== 'function' || options.expiresInSeconds !== undefined || options.tokenType !== undefined
      || options.baseUrl !== undefined || options.fetch !== undefined || options.headers !== undefined || options.signingSecretTimeoutMs !== undefined) {
      throw new ZAIClientError('invalid-input', 'fetchToken must be a function and cannot be combined with local signing options.');
    }
    acquire = options.fetchToken;
    timeoutMs = options.acquireTimeoutMs ?? 30_000;
    if (!validSeconds(timeoutMs, 1) || timeoutMs > 2_147_483_647) {
      throw new ZAIClientError('invalid-input', 'acquireTimeoutMs must be a positive integer no greater than 2147483647.');
    }
  }

  let cached: ZAIToken | undefined;
  let pending: {promise: Promise<string>; controller: AbortController} | undefined;
  let disposed = false;
  let reason: ZAITokenAcquisitionContext['reason'] = 'initial';
  const getToken = () => {
    if (disposed) return Promise.reject(new ZAIClientError('aborted', 'The token provider has been disposed.'));
    if (pending) return pending.promise;
    if (cached && cached.expiresAt - nowSeconds() > refreshBeforeSeconds) {
      return Promise.resolve(cached.token);
    }
    const controller = new AbortController();
    const {signal} = controller;
    const context: ZAITokenAcquisitionContext = Object.freeze({signal, reason});
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
        result = await acquire(context);
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
      reason = 'refresh';
      return cached.token;
    });
    const promise = Promise.race([acquisition, interrupted]).finally(() => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      if (pending?.controller === controller) pending = undefined;
    });
    pending = {promise, controller};
    if (timeoutMs !== undefined) {
      timer = setTimeout(() => controller.abort(hasCredentials
        ? new ZAIClientError('authentication', 'Signing-secret request timed out.', secretRequest ? {method: 'GET', path: '/signing_secret'} : undefined)
        : new ZAIClientError('authentication', 'Token acquisition timed out.')), timeoutMs);
    }
    return promise;
  };

  const invalidate = (options?: {signingSecret?: boolean}): void => {
    if (options !== undefined && (!options || typeof options !== 'object'
      || (options.signingSecret !== undefined && typeof options.signingSecret !== 'boolean'))) {
      throw new ZAIClientError('invalid-input', 'signingSecret must be a boolean when provided.');
    }
    cached = undefined;
    reason = 'invalidated';
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
