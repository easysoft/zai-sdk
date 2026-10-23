import {describe, expect, it, vi} from 'vitest';
import {createZAIClient} from '../src/client.js';
import type {ZAIClient} from '../src/client.js';
import type {CreateZAIClientOptions, ZAIRequestOptions} from '../src/types.js';

const baseUrl = 'https://zai.test/v1/zai';
const auth = {mode: 'auto' as const, appID: 'app', appKey: 'key', userID: 'user'};
type TokenType = 'admin' | 'user';
const operations = {
  shared: (client: ZAIClient, options?: ZAIRequestOptions) => client.settings.models.list(options),
  admin: (client: ZAIClient, options?: ZAIRequestOptions) => client.coding.runners.list(options),
  userOnly: (client: ZAIClient, options?: ZAIRequestOptions) => client.coding.keys.getPublic('agent', options),
};
const createFixture = (automatic: boolean, allowedTokenTypes?: readonly TokenType[]) => {
  const getToken = vi.fn((admin: boolean) => admin ? 'ak-external' : 'ek-external');
  const fetch = vi.fn<typeof globalThis.fetch>(async input => {
    const request = input as Request;
    return Response.json(new URL(request.url).pathname.endsWith('/signing_secret')
      ? {app_id: auth.appID, signing_secret: 'secret', token_prefix: 'ek-'} : {ok: true});
  });
  const client = createZAIClient({baseUrl, fetch, allowedTokenTypes, ...(automatic ? {auth} : {getToken})});
  return {client, getToken, fetch};
};

describe.each([false, true])('client token-purpose restrictions (automatic: %s)', automatic => {
  it.each([
    {allowed: ['user'], operation: 'admin'},
    {allowed: ['user'], operation: 'admin', tokenType: 'user'},
    {allowed: ['user'], operation: 'shared', tokenType: 'admin'},
    {allowed: ['admin'], operation: 'shared'},
    {allowed: ['admin'], operation: 'shared', tokenType: 'user'},
    {allowed: ['admin'], operation: 'userOnly'},
    {allowed: ['admin'], operation: 'userOnly', tokenType: 'admin'},
    {allowed: ['user', 'admin'], operation: 'admin', tokenType: 'user'},
    {allowed: ['user', 'admin'], operation: 'userOnly', tokenType: 'admin'},
  ] satisfies {allowed: TokenType[]; operation: keyof typeof operations; tokenType?: TokenType}[])(
    'rejects $operation with allowed=$allowed and override=$tokenType before any acquisition or fetch', async ({allowed, operation, tokenType}) => {
      const {client, getToken, fetch} = createFixture(automatic, allowed);
      await expect(operations[operation](client, {tokenType})).rejects.toMatchObject({code: 'invalid-input'});
      expect(getToken).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    {allowed: ['user'], operation: 'shared', expected: 'user'},
    {allowed: ['user'], operation: 'userOnly', expected: 'user'},
    {allowed: ['user'], operation: 'shared', tokenType: 'user', expected: 'user'},
    {allowed: ['admin'], operation: 'admin', expected: 'admin'},
    {allowed: ['admin'], operation: 'shared', tokenType: 'admin', expected: 'admin'},
    {allowed: ['admin', 'user'], operation: 'shared', expected: 'user'},
  ] satisfies {allowed: TokenType[]; operation: keyof typeof operations; tokenType?: TokenType; expected: TokenType}[])(
    'allows $operation with allowed=$allowed and override=$tokenType', async ({allowed, operation, tokenType, expected}) => {
      const {client, getToken, fetch} = createFixture(automatic, allowed);
      await expect(operations[operation](client, {tokenType})).resolves.toEqual({ok: true});
      const request = fetch.mock.calls.at(-1)![0] as Request;
      expect(request.headers.get('authorization')).toMatch(expected === 'admin' ? /^Bearer ak-/ : /^Bearer ek-/);
      if (!automatic) expect(getToken).toHaveBeenCalledWith(expected === 'admin');
      expect(fetch).toHaveBeenCalledTimes(automatic && expected === 'user' ? 2 : 1);
    },
  );

  it('allows both token types by default while shared operations still select user', async () => {
    const {client, fetch} = createFixture(automatic);
    await client.settings.models.list();
    expect((fetch.mock.calls.at(-1)![0] as Request).headers.get('authorization')).toMatch(/^Bearer ek-/);
    await client.coding.runners.list();
    expect((fetch.mock.calls.at(-1)![0] as Request).headers.get('authorization')).toMatch(/^Bearer ak-/);
    await client.settings.models.list({tokenType: 'admin'});
    expect((fetch.mock.calls.at(-1)![0] as Request).headers.get('authorization')).toMatch(/^Bearer ak-/);
  });

  it('snapshots the allowed list so later array mutation cannot change client authority', async () => {
    const allowed: TokenType[] = ['user'];
    const {client, getToken, fetch} = createFixture(automatic, allowed);
    allowed.splice(0, 1, 'admin');
    await expect(client.coding.runners.list()).rejects.toMatchObject({code: 'invalid-input'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    await expect(client.settings.models.list()).resolves.toEqual({ok: true});
    expect((fetch.mock.calls.at(-1)![0] as Request).headers.get('authorization')).toMatch(/^Bearer ek-/);
  });

  it('accepts immutable lists and repeated legal entries', async () => {
    const {client} = createFixture(automatic, Object.freeze(['user', 'user'] as const));
    await expect(client.settings.models.list()).resolves.toEqual({ok: true});
    await expect(client.coding.runners.list()).rejects.toMatchObject({code: 'invalid-input'});
  });

  it.each([null, 'user', [], ['invalid'], ['user', 'invalid'], [undefined], [null], new Array(1), new Set(['user']), {0: 'user', length: 1}])(
    'rejects invalid allowedTokenTypes at construction (%j)', allowedTokenTypes => {
      const getToken = vi.fn(() => 'token');
      const fetch = vi.fn<typeof globalThis.fetch>();
      expect(() => createZAIClient({baseUrl, fetch, allowedTokenTypes, ...(automatic ? {auth} : {getToken})} as CreateZAIClientOptions))
        .toThrow(expect.objectContaining({code: 'invalid-input'}));
      expect(getToken).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each(['shared', 'admin'] as const)('does not acquire credentials for an already-cancelled %s request', async operation => {
    const {client, getToken, fetch} = createFixture(automatic, ['user']);
    const signal = AbortSignal.abort('already cancelled');
    await expect(operations[operation](client, {signal})).rejects.toMatchObject({code: 'aborted'});
    expect(getToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

it('lets a user-only automatic client use AK internally to acquire its EK signing secret', async () => {
  const {client, fetch} = createFixture(true, ['user']);
  await client.settings.models.list();
  const requests = fetch.mock.calls.map(([input]) => input as Request);
  expect(requests).toHaveLength(2);
  expect(requests[0]!.url).toBe(`${baseUrl}/signing_secret`);
  expect(requests[0]!.headers.get('authorization')).toMatch(/^Bearer ak-/);
  expect(requests[1]!.url).toBe(`${baseUrl}/models`);
  expect(requests[1]!.headers.get('authorization')).toMatch(/^Bearer ek-/);
  await expect(client.coding.runners.list()).rejects.toMatchObject({code: 'invalid-input'});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it.each(['admin', 'user'] as const)('enforces requested purpose without interpreting an opaque external %s token', async tokenType => {
  const opaqueToken = tokenType === 'admin' ? 'ek-opaque' : 'ak-opaque';
  const getToken = vi.fn(() => opaqueToken);
  const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ok: true}));
  const client = createZAIClient({baseUrl, getToken, fetch, allowedTokenTypes: [tokenType]});
  await client.settings.models.list({tokenType});
  expect((fetch.mock.calls[0]![0] as Request).headers.get('authorization')).toBe(`Bearer ${opaqueToken}`);
  expect(getToken).toHaveBeenCalledWith(tokenType === 'admin');
});
