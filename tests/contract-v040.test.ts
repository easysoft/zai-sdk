import {expect, it, vi} from 'vitest';
import {createZAIClient, type ZAIAuthContext} from '../src/index.js';

function setup(response: unknown = {}, status = 200) {
  const requests: Request[] = [];
  const getToken = vi.fn((_context: ZAIAuthContext) => 'test-token');
  const client = createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken, fetch: async input => {
    requests.push(input as Request);
    return Response.json(response, {status});
  }});
  return {client, requests, getToken};
}

it('keeps skill filters separate from request options', async () => {
  const {client, requests} = setup([]);
  await client.skills.list({scope: 'personal', owner_id: 'user + 1'}, {headers: {'x-request': 'catalog'}});
  expect(Object.fromEntries(new URL(requests[0]!.url).searchParams)).toEqual({scope: 'personal', owner_id: 'user + 1'});
  expect(requests[0]!.headers.get('x-request')).toBe('catalog');
  await client.skills.list(undefined, {headers: {'x-request': 'unfiltered'}});
  expect(new URL(requests[1]!.url).search).toBe('');
  expect(requests[1]!.headers.get('x-request')).toBe('unfiltered');
});

it.each([[200, {goal: {status: 'paused'}}], [202, {id: 'turn', kind: 'message'}]] as const)(
  'accepts HTTP %s from turn start without starting another request', async (status, result) => {
    const {client, requests} = setup(result, status);
    expect(await client.coding.turns.start('session', {content: '/goal pause'})).toEqual(result);
    expect(requests).toHaveLength(1);
  },
);

it.each([undefined, null, 'high'])('preserves the thinking override %j without filling defaults', async thinking_option_id => {
  const {client, requests} = setup({}, 202);
  await client.coding.turns.start('session', {content: 'Hello', thinking_option_id});
  expect(await requests[0]!.json()).toEqual({content: 'Hello', ...(thinking_option_id === undefined ? {} : {thinking_option_id})});
});

it('sends repository bytes and explicit repository-relative paths without creating attachments', async () => {
  const result = {repo_key: 'main', path: '目录/a + b.bin', name: 'a + b.bin', size: 3};
  const {client, requests} = setup(result);
  const bytes = Uint8Array.of(0, 255, 42);
  expect(await client.coding.sessions.writeRepositoryFile('session', {repo_key: 'main', path: result.path}, new Blob([bytes]))).toEqual(result);
  expect(new URL(requests[0]!.url).pathname).toBe('/v1/zai/coding/sessions/session/repository-files');
  expect(Object.fromEntries(new URL(requests[0]!.url).searchParams)).toEqual({repo_key: 'main', path: result.path});
  expect(requests[0]!.headers.get('content-type')).toBe('application/octet-stream');
  expect(new Uint8Array(await requests[0]!.arrayBuffer())).toEqual(bytes);
  expect(requests).toHaveLength(1);
});

it('retains diff pagination and truncation without fetching further pages', async () => {
  const result = {diffs: [{truncated: true}], pages: [{repo_key: 'main', next_offset: 20, total: 30}]};
  const {client, requests} = setup(result);
  expect(await client.coding.git.diff('session', {repo_key: 'main', offset: 0, limit: 20, path: 'src/文件.ts', include_diff: 'false'})).toEqual(result);
  expect(Object.fromEntries(new URL(requests[0]!.url).searchParams)).toEqual({repo_key: 'main', offset: '0', limit: '20', path: 'src/文件.ts', include_diff: 'false'});
  expect(requests).toHaveLength(1);
});

it('preserves unlimited quota values and selects the requested allowed identity', async () => {
  const result = {configured: true, remaining_tokens: null, available_tokens: null, status: 'active'};
  const {client, requests, getToken} = setup(result);
  expect(await client.me.getQuota()).toEqual(result);
  await client.me.getQuota({tokenType: 'admin'});
  expect(getToken.mock.calls.map(([context]) => context.purpose)).toEqual(['user', 'admin']);
  expect(requests.every(request => new URL(request.url).pathname === '/v1/zai/me/quota')).toBe(true);
});

it('returns repository synchronization acceptance without polling or retrying', async () => {
  const result = {repository: {sync: {status: 'pending', available: null, task_id: 'task', error: null, completed_at: null}}};
  const {client, requests} = setup(result, 202);
  expect(await client.coding.repositories.sync('agent', 'workspace', 'repo')).toEqual(result);
  expect(requests).toHaveLength(1);
  expect(requests[0]!.method).toBe('POST');
  expect(new URL(requests[0]!.url).pathname).toBe('/v1/zai/coding/agents/agent/workspaces/workspace/repos/repo/sync');
});

it('uses admin credentials and a reusable idempotency key for session-bound runner recovery', async () => {
  const {client, requests, getToken} = setup({status: 'starting'}, 202);
  await client.coding.sessions.ensureRunnerInstance('session', {}, {idempotencyKey: 'recover-session'});
  expect(getToken).toHaveBeenCalledWith(expect.objectContaining({purpose: 'admin'}));
  expect(requests[0]!.headers.get('idempotency-key')).toBe('recover-session');
  expect(new URL(requests[0]!.url).pathname).toBe('/v1/zai/coding/sessions/session/runner-instance');
  expect(await requests[0]!.json()).toEqual({});
  await expect(client.coding.sessions.ensureRunnerInstance('session', {}, {tokenType: 'user'})).rejects.toMatchObject({code: 'invalid-input'});
  expect(requests).toHaveLength(1);
  expect(getToken).toHaveBeenCalledTimes(1);
  await client.coding.agents.ensureRunnerInstance('agent', {});
  expect(getToken).toHaveBeenLastCalledWith(expect.objectContaining({purpose: 'user'}));
});
