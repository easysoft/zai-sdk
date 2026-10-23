import {ZAIClientError} from './errors.js';
import type {ZAIErrorCode, ZAIErrorOptions} from './errors.js';

type AuthErrorDetails = Pick<ZAIErrorOptions, 'status' | 'method' | 'path'> & {code: ZAIErrorCode; message: string};
const snapshots = new WeakMap<object, Readonly<AuthErrorDetails>>();
const codes: readonly ZAIErrorCode[] = ['authentication', 'http', 'network', 'aborted', 'invalid-input', 'invalid-response'];

/** Only SDK-owned messages and routes belong here; never pass callback error text. */
export function createAuthError(code: ZAIErrorCode, message: string, options: Pick<ZAIErrorOptions, 'status' | 'method' | 'path'> = {}): ZAIClientError {
  const {status} = options;
  const details = Object.freeze({
    code: codes.includes(code) ? code : 'authentication' as const,
    message,
    status: typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599 ? status : undefined,
    method: options.method,
    path: options.path,
  });
  const error = new ZAIClientError(details.code, details.message, details);
  snapshots.set(error, details);
  return error;
}

export function sanitizeAuthError(cause: unknown, message: string): ZAIClientError {
  // instanceof cannot establish trust: callbacks can construct or mutate SDK errors.
  const details = typeof cause === 'object' && cause !== null ? snapshots.get(cause) : undefined;
  return details ? createAuthError(details.code, details.message, details) : createAuthError('authentication', message);
}
