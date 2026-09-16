import {md5} from '@noble/hashes/legacy.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import {ZAIClientError} from './errors.js';

export interface ZAICredentials {
  appID: string;
  appKey: string;
  userID: string;
}

/** Token expiration is a Unix timestamp in seconds, not milliseconds. */
export interface ZAIToken {
  token: string;
  expiresAt: number;
}

export type ZAITokenProvider = () => Promise<string>;

export type ZAITokenProviderOptions = {
  /** Renew before a request when this many seconds (or less) remain. Default: 60. */
  refreshBeforeSeconds?: number;
} & (
  | {
    credentials: ZAICredentials;
    /** Lifetime of a locally signed token in seconds. Default: 1000. */
    expiresInSeconds?: number;
    fetchToken?: never;
  }
  | {
    fetchToken: () => ZAIToken | Promise<ZAIToken>;
    credentials?: never;
    expiresInSeconds?: never;
  }
);

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

function validateCredentials(credentials: ZAICredentials): void {
  if (!credentials || typeof credentials !== 'object'
    || [credentials.appID, credentials.appKey, credentials.userID].some(value => typeof value !== 'string' || value.length === 0)) {
    throw new ZAIClientError('invalid-input', 'appID, appKey and userID must be non-empty strings.');
  }
}

function validSeconds(value: number, minimum: number): boolean {
  return Number.isSafeInteger(value) && value >= minimum;
}

/** Sign a ZAI token using the server's MD5 + Latin-1 Base64 protocol. */
export function createZAIToken(
  appID: string,
  appKey: string,
  userID: string,
  expiredTime = nowSeconds() + 1000,
): string {
  validateCredentials({appID, appKey, userID});
  if (!validSeconds(expiredTime, 0)) {
    throw new ZAIClientError('invalid-input', 'expiredTime must be a non-negative integer Unix timestamp in seconds.');
  }
  const payload = {
    hash: bytesToHex(md5(new TextEncoder().encode(appKey + appID + userID + expiredTime))),
    app_id: appID,
    user_id: userID,
    expired_time: expiredTime,
  };
  try {
    // Intentionally use btoa directly: UTF-8 Base64 would change the ZAI protocol.
    return `ak-${btoa(JSON.stringify(payload))}`;
  } catch {
    throw new ZAIClientError('invalid-input', 'appID and userID must be encodable by the ZAI Latin-1 Base64 protocol.');
  }
}

/**
 * Cache and renew tokens on demand, sharing renewal between concurrent callers.
 * There are no timers. Share this provider between clients only when they use
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

  let acquire: () => ZAIToken | Promise<ZAIToken>;
  if (hasCredentials) {
    const credentials = options.credentials as ZAICredentials;
    validateCredentials(credentials);
    const {appID, appKey, userID} = credentials;
    const expiresInSeconds = options.expiresInSeconds ?? 1000;
    if (!validSeconds(expiresInSeconds, 1)) {
      throw new ZAIClientError('invalid-input', 'expiresInSeconds must be a positive integer.');
    }
    acquire = () => {
      const expiresAt = nowSeconds() + expiresInSeconds;
      return {token: createZAIToken(appID, appKey, userID, expiresAt), expiresAt};
    };
  } else {
    if (typeof options.fetchToken !== 'function' || options.expiresInSeconds !== undefined) {
      throw new ZAIClientError('invalid-input', 'fetchToken must be a function; expiresInSeconds applies only to credentials.');
    }
    acquire = options.fetchToken;
  }

  let cached: ZAIToken | undefined;
  let pending: Promise<string> | undefined;
  return () => {
    if (pending) return pending;
    if (cached && cached.expiresAt - nowSeconds() > refreshBeforeSeconds) {
      return Promise.resolve(cached.token);
    }
    pending = Promise.resolve().then(async () => {
      let result: ZAIToken;
      try {
        result = await acquire();
      } catch (cause) {
        if (cause instanceof ZAIClientError && cause.code === 'invalid-input') throw cause;
        throw new ZAIClientError('authentication', 'Failed to acquire a ZAI token.', {cause});
      }
      if (!result || typeof result.token !== 'string' || result.token.trim().length === 0
        || !validSeconds(result.expiresAt, 0) || result.expiresAt <= nowSeconds()) {
        throw new ZAIClientError('authentication', 'Token source must return a non-empty token with a future integer expiresAt in Unix seconds.');
      }
      // Snapshot the result: later mutation by the fetcher cannot alter our cache.
      cached = {token: result.token, expiresAt: result.expiresAt};
      return cached.token;
    }).finally(() => {
      pending = undefined;
    });
    return pending;
  };
}
