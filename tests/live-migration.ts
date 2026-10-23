// Run explicitly: node --env-file=.env.local --import tsx --test tests/live-migration.ts
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import test, {after, type TestContext} from 'node:test';
import {createZAIClient, createZAITokenProvider, ZAIClientError, type ZAIClient, type ZAIStreamEvent} from '../src/index.js';
import {ZAI_OPERATIONS} from '../src/operations.js';

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}
const url = new URL(required('TEST_ZAI_BASE_URL'));
if (url.pathname === '/') url.pathname = '/v1/zai';
const baseUrl = url.href;
const credentials = {appID: required('TEST_ZAI_APP_ID'), appKey: required('TEST_ZAI_APP_KEY'), userID: required('TEST_ZAI_USER_ID')};
const options = (ms = 30_000) => ({signal: AbortSignal.timeout(ms)});
const marker = `zai-sdk-migration-${randomUUID()}`;
const requests: {method: string; path: string; token: string; status: number; ms: number}[] = [];
const results: {name: string; pass: boolean; error?: string}[] = [];
const cleanupResults: {name: string; status: 'pending' | 'cleaned' | 'failed'; error?: string}[] = [];
const permissionMismatches: string[] = [];
const checkFailures: string[] = [];
const codingResources = {agentIds: [] as string[], profileId: '', instanceIds: [] as string[], workspaceIds: [] as string[], sessionIds: [] as string[], fileIds: [] as string[], turnIds: [] as string[]};
function track(ids: string[], id: string) {
  if (!ids.includes(id)) ids.push(id);
  saveResults();
}
function saveResults() {
  mkdirSync('test-results', {recursive: true});
  writeFileSync('test-results/live-migration.json', JSON.stringify({date: new Date().toISOString(), baseUrl, marker, results, cleanupResults, codingResources, permissionMismatches, checkFailures, requests}, null, 2));
}
const tracedFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const pathname = new URL(request.url).pathname.slice(url.pathname.replace(/\/$/, '').length);
  const operation = ZAI_OPERATIONS.find(op => op.method.toUpperCase() === request.method
    && new RegExp(`^${op.path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, '[^/]+')}$`).test(pathname));
  const start = Date.now();
  const response = await fetch(request);
  requests.push({method: request.method, path: operation?.path ?? pathname,
    token: request.headers.get('authorization')?.startsWith('Bearer ak-') ? 'ak' : 'ek', status: response.status, ms: Date.now() - start});
  saveResults();
  return response;
};
const client = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch: tracedFetch});
const getAdmin = createZAITokenProvider({credentials});
const getUser = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch: tracedFetch});
const admin = createZAIClient({baseUrl, getToken: getAdmin, fetch: tracedFetch});
const user = createZAIClient({baseUrl, getToken: getUser, fetch: tracedFetch});

function safeError(error: unknown): Error {
  if (error instanceof ZAIClientError) {
    const reason = error.errorInfo?.reason_code;
    return new Error(`${error.method ?? ''} ${error.path ?? ''}: ${error.code}, HTTP ${error.status ?? 'none'}${reason && /^[a-zA-Z0-9_-]+$/.test(reason) ? `, ${reason}` : ''}`);
  }
  return new Error(error instanceof Error ? error.message : 'Live check failed.');
}

type Cleanup = (name: string, run: () => Promise<unknown>) => void;
async function independentCheck(name: string, run: () => Promise<unknown>) {
  try { await run(); }
  catch (error) { checkFailures.push(`${name}: ${safeError(error).message}`); saveResults(); }
}
async function expectForbidden(name: string, request: Promise<unknown>) {
  try { await request; }
  catch (error) {
    if (error instanceof ZAIClientError && error.status === 403) return;
    throw error;
  }
  // Keep testing independent steps, but report the contract mismatch as a failure.
  permissionMismatches.push(`${name}: expected HTTP 403, but the server accepted the token.`);
  saveResults();
}
function live(name: string, run: (t: TestContext, cleanup: Cleanup) => Promise<void>) {
  test(name, {timeout: 600_000}, async t => {
    const cleanups: {record: typeof cleanupResults[number]; run: () => Promise<unknown>}[] = [];
    const errors: Error[] = [];
    const mismatchStart = permissionMismatches.length;
    const failureStart = checkFailures.length;
    try { await run(t, (name, run) => {
      const record: typeof cleanupResults[number] = {name, status: 'pending'};
      cleanupResults.push(record);
      cleanups.push({record, run});
      saveResults();
    }); }
    catch (error) { errors.push(safeError(error)); }
    finally {
      for (const cleanup of cleanups.reverse()) {
        try { await cleanup.run(); cleanup.record.status = 'cleaned'; t.diagnostic(`Cleaned up ${cleanup.record.name}.`); }
        catch (error) {
          cleanup.record.status = 'failed';
          cleanup.record.error = safeError(error).message;
          errors.push(new Error(`Cleanup ${cleanup.record.name}: ${cleanup.record.error}`));
        }
        saveResults();
      }
    }
    errors.push(...permissionMismatches.slice(mismatchStart).map(message => new Error(message)));
    errors.push(...checkFailures.slice(failureStart).map(message => new Error(message)));
    results.push({name, pass: !errors.length, ...errors.length && {error: errors.map(e => e.message).join('; ')}});
    saveResults();
    if (errors.length) throw new AggregateError(errors, errors.map(e => e.message).join('; '));
  });
}

after(saveResults);

live('live read-only ak/ek permissions and getToken(admin)', async t => {
  const shared: [string, (c: ZAIClient) => Promise<unknown>][] = [
    ['agents', c => c.agents.list(options())],
    ['sessions', c => c.sessions.list({page_size: 1}, options())],
    ['chat.conversations', c => c.chat.conversations.list({page_size: 1}, options())],
    ['coding.sessions', c => c.coding.sessions.list({page_size: '1'}, options())],
    ['memories', c => c.memories.list(options())],
    ['qa', c => c.qa.list(options())],
    ['skills', c => c.skills.list(options())],
    ['models', c => c.settings.models.list(options())],
  ];
  const restricted: [string, (c: ZAIClient) => Promise<unknown>][] = [
    ['channels', c => c.settings.channels.list(options())],
    ['signing secret', c => c.settings.signingSecret.get(options())],
    ['runners', c => c.coding.runners.list(options())],
    ['coding agents', c => c.coding.agents.list(options())],
    ['runner image policies', async c => {
      const response = await c.coding.runners.listImagePolicies(options());
      assert.ok(Array.isArray(response.policies), 'Image policies must be returned as an array.');
      for (const policy of response.policies) {
        assert.equal(typeof policy.id, 'string');
        assert.equal(typeof policy.runner_adapter, 'string');
      }
      t.diagnostic(`Runner image policy response validated: ${response.policies.length} policies.`);
    }],
    ['memory queue', c => c.memories.getEmbeddingQueueStats(options())],
  ];
  for (const [name, call] of shared) {
    await independentCheck(`${name} with ak`, () => call(admin));
    await independentCheck(`${name} with ek`, () => call(user));
    t.diagnostic(`${name}: ak and ek checked; failures are recorded separately.`);
  }
  for (const [name, call] of restricted) {
    await independentCheck(`${name} with ak`, () => call(admin));
    await independentCheck(`${name} with ek`, () => expectForbidden(`${name} with ek`, call(user)));
    t.diagnostic(`${name}: ak access and ek rejection checked; failures are recorded separately.`);
  }
  const agent = (await admin.coding.agents.list(options())).agents.find(item => item.status === 'active');
  if (agent) {
    await independentCheck('Coding Agent detail with ak', async () => {
      const detail = await admin.coding.agents.get(agent.id, options());
      assert.equal(detail.id, agent.id);
      assert.equal(detail.runner_profile_id, agent.runner_profile_id);
    });
    await independentCheck('Coding Agent detail with ek', () => expectForbidden('Coding Agent detail with ek', user.coding.agents.get(agent.id, options())));
    t.diagnostic('Existing Coding Agent detail permissions checked without changing the Agent.');
  } else {
    t.diagnostic('No active Coding Agent available; read-only detail permission check not covered.');
  }
  const flags: boolean[] = [];
  const explicit = createZAIClient({baseUrl, fetch: tracedFetch, getToken: admin => {
    flags.push(admin);
    return admin ? getAdmin() : getUser();
  }});
  await explicit.agents.list(options());
  await explicit.settings.models.list(options());
  await explicit.settings.models.list({...options(), tokenType: 'admin'});
  await explicit.coding.runners.list(options());
  assert.deepEqual(flags, [false, false, true, true]);
  const diagnosis = await client.doctor();
  assert.ok(diagnosis.details.filter(detail => detail.type !== 'agents').every(detail => detail.pass), 'Read-only connectivity checks must pass.');
  t.diagnostic(`Read-only doctor: ${diagnosis.pass ? 'all checks passed' : 'no active custom Chat Agent; Coding validation is independent'}.`);
});

async function consume(stream: AsyncIterableIterator<ZAIStreamEvent>) {
  let count = 0;
  let done = false;
  for await (const event of stream) {
    if (event.type === 'done') done = true;
    else count++;
  }
  assert.ok(count > 0 && done, 'Message SSE must contain data and DONE.');
}

live('live Chat CRUD, both JSON/SSE endpoints and file extraction', async (t, cleanup) => {
  const {agents} = await client.agents.list(options());
  const agent = agents.find(a => a.type === 'custom' && a.status === 'active' && a.is_default)
    ?? agents.find(a => a.type === 'custom' && a.status === 'active');
  assert.ok(agent, 'An active custom Agent is required.');
  const conversation = await client.chat.conversations.create({title: marker, agent_id: agent.id,
    category: 'zai-sdk-live', custom_data: {sdk_live_test: marker},
    reference_settings: {memories: {collections: []}, qa: {enabled: false}},
  }, options());
  cleanup(`Chat conversation ${conversation.id}`, async () => {
    await client.chat.conversations.delete(conversation.id, options());
    const remaining = await client.chat.conversations.list({category: 'zai-sdk-live', page_size: 100}, options());
    assert.ok(!remaining.some(c => c.id === conversation.id), 'Deleted test conversation must not remain listed.');
  });
  assert.equal((await client.chat.conversations.get(conversation.id, options())).title, marker);
  await client.chat.conversations.update(conversation.id, {title: `${marker}-updated`}, options());
  assert.equal((await client.chat.conversations.get(conversation.id, options())).title, `${marker}-updated`);
  const input = {content: 'Reply with exactly OK. Do not use tools or read files.', tools: [], tool_execution_mode: 'schema-only' as const};
  assert.ok((await client.chat.messages.send(conversation.id, input, options(60_000))).content?.trim(), 'Chat JSON must return text.');
  await consume(await client.chat.messages.stream(conversation.id, input, options(60_000)));
  assert.ok((await client.chat.send({...input, conversation_id: conversation.id}, options(60_000))).content?.trim(), 'Convenience Chat JSON must return text.');
  await consume(await client.chat.stream({...input, conversation_id: conversation.id}, options(60_000)));
  const history = await client.chat.messages.list(conversation.id, options());
  assert.ok(history.length >= 8, 'Four Chat turns must appear in history.');
  const message = history[0]!;
  assert.equal((await client.chat.messages.get(conversation.id, message.id, options())).id, message.id);
  await client.chat.messages.delete(conversation.id, message.id, options());
  await client.chat.messages.deleteAll(conversation.id, options());
  assert.equal((await client.chat.messages.list(conversation.id, options())).length, 0);
  const text = 'ZAI SDK migration — 你好\n';
  const extracted = await client.files.extract({file: {blob: new Blob([text], {type: 'text/plain'}), filename: 'sdk-migration.txt'}}, options());
  assert.equal(extracted.content.trim(), text.trim());
  t.diagnostic('Four Chat turns, history CRUD and UTF-8 file-only multipart extraction passed.');
});

live('live QA create, key upsert and update', async (t, cleanup) => {
  const input = {question: `SDK test ${marker}?`, answer: 'OK', key: marker, attrs: {sdk_live_test: marker}};
  const pair = await client.qa.create(input, options());
  cleanup(`QA pair ${pair.id}`, async () => {
    await client.qa.delete(pair.id, options());
    assert.ok(!(await client.qa.list(options())).some(p => p.id === pair.id), 'Deleted test QA must not remain listed.');
  });
  assert.equal((await client.qa.get(pair.id, options())).answer, 'OK');
  const upsert = await client.qa.create({...input, answer: 'UPDATED'}, options());
  assert.equal(upsert.id, pair.id);
  await client.qa.update(pair.id, {question: input.question, answer: 'UPDATED AGAIN'}, options());
  assert.equal((await client.qa.get(pair.id, options())).answer, 'UPDATED AGAIN');
  t.diagnostic('QA create, same-key upsert, get and update passed.');
});

live('live isolated Coding workspace, turn and event stream', async (t, cleanup) => {
  // The application Coding environment must already be configured in the console.
  cleanup(`runner Agent named ${marker}`, async () => {
    const agents = (await client.coding.agents.list(options())).agents;
    for (const item of agents.filter(item => item.name === marker && item.status !== 'deleted')) {
      track(codingResources.agentIds, item.id);
      await client.coding.agents.delete(item.id, options());
    }
    assert.ok(!(await client.coding.agents.list(options())).agents.some(a => codingResources.agentIds.includes(a.id) && a.status !== 'deleted'));
  });
  const agent = await client.coding.agents.create({name: marker}, options());
  codingResources.profileId = agent.runner_profile_id;
  track(codingResources.agentIds, agent.id);
  console.log('Coding live: temporary Agent created; checking permissions and shared user configuration.');
  assert.equal((await client.coding.agents.get(agent.id, options())).runner_profile_id, agent.runner_profile_id);
  await expectForbidden('Coding Agent detail with ek', user.coding.agents.get(agent.id, options()));
  await expectForbidden('Runner Profile detail with ek', user.coding.runners.get(agent.runner_profile_id, options()));
  await expectForbidden('Runner instances with ek', user.coding.runners.instances.list(agent.runner_profile_id, undefined, options()));
  await expectForbidden('SSH public key with ak', admin.coding.keys.getPublic(agent.id, options()));
  await expectForbidden('Git identity with ak', admin.coding.git.getIdentity(agent.id, options()));

  // These settings are shared by the application's user, not isolated by Agent.
  try {
    const key = await client.coding.keys.getPublic(agent.id, options());
    assert.equal((await client.coding.keys.ensure(agent.id, {}, options())).fingerprint, key.fingerprint);
    t.diagnostic('Existing SSH key ensured without rotating or creating a new key.');
  } catch (error) {
    if (!(error instanceof ZAIClientError && error.status === 404)) throw error;
    t.diagnostic('User has no SSH key; key creation skipped because no deletion API exists.');
  }
  try {
    await client.coding.git.getIdentity(agent.id, options());
    t.diagnostic('Existing Git identity read without modification.');
  } catch (error) {
    if (!(error instanceof ZAIClientError && error.status === 404)) throw error;
    t.diagnostic('User has no Git identity; configuration left unchanged.');
  }

  async function instances() {
    const found: Awaited<ReturnType<ZAIClient['coding']['runners']['instances']['list']>>['instances'] = [];
    for (let page = 1; page <= 100; page++) {
      const batch = (await client.coding.runners.instances.list(agent.runner_profile_id, {page, page_size: 100}, options())).instances;
      assert.ok(batch.every(item => !found.some(previous => previous.id === item.id)), 'Instance pagination must advance.');
      found.push(...batch);
      if (batch.length < 100) return found;
    }
    throw new Error('Instance baseline exceeds the live test pagination limit.');
  }
  const baselineInstances = await instances();
  const baseline = new Set(baselineInstances.map(instance => instance.id));
  for (const instance of baselineInstances.filter(item => item.external_user_id === credentials.userID && item.status !== 'deleted')) {
    assert.ok(instance.enabled && instance.desired_state === 'running',
      'An existing shared instance must already be enabled and ready; leave stopped or unavailable instances unchanged.');
    assert.equal((await client.coding.agents.getStatus(agent.id, undefined, options())).status, 'ready',
      'Do not start or alter a pre-existing shared instance.');
  }
  cleanup(`new user Runner instances in profile ${agent.runner_profile_id} (soft delete; volumes retained by service)`, async () => {
    for (const id of codingResources.instanceIds) {
      assert.ok(!baseline.has(id), 'Never delete a pre-existing instance.');
      const instance = await client.coding.runners.instances.get(agent.runner_profile_id, id, options());
      assert.equal(instance.external_user_id, credentials.userID, 'Only clean the authenticated test user instance.');
      await client.coding.runners.instances.delete(agent.runner_profile_id, id, options());
      const deadline = Date.now() + 60_000;
      for (;;) {
        const remaining = (await instances()).find(item => item.id === id);
        if (!remaining || remaining.status === 'deleted') break;
        assert.ok(Date.now() < deadline, 'The test instance must become absent or soft deleted.');
        await delay(1000);
      }
    }
  });
  for (const tokenType of ['user', 'admin'] as const) {
    const query = tokenType === 'admin' ? {external_user_id: credentials.userID} : undefined;
    const stream = await client.coding.agents.streamStatus(agent.id, query, {...options(), tokenType});
    try {
      const first = await stream.next();
      assert.ok(!first.done, 'Runner status stream must deliver a snapshot.');
      assert.equal(first.value.event, 'runner.status');
      const data = first.value.data;
      assert.ok(data && typeof data === 'object' && 'status' in data && typeof data.status === 'string');
    } finally { await stream.return?.(); }
    assert.equal((await client.coding.agents.getStatus(agent.id, query, {...options(), tokenType})).agent_id, agent.id);
  }
  const requestCount = requests.length;
  await assert.rejects(client.coding.agents.getStatus(agent.id, {external_user_id: 'not-the-current-user'}, options()),
    error => error instanceof ZAIClientError && error.code === 'invalid-input');
  assert.equal(requests.length, requestCount, 'User scope override must be rejected before any HTTP request.');

  const ensureOptions = {...options(), idempotencyKey: `${marker}-instance`};
  const instance = await client.coding.agents.ensureRunnerInstance(agent.id, {}, ensureOptions);
  if (!baseline.has(instance.id)) track(codingResources.instanceIds, instance.id);
  assert.equal(instance.external_user_id, credentials.userID);
  assert.equal(instance.runner_profile_id, agent.runner_profile_id);
  const repeatedInstance = await client.coding.agents.ensureRunnerInstance(agent.id, {}, {...ensureOptions, ...options()});
  if (!baseline.has(repeatedInstance.id)) track(codingResources.instanceIds, repeatedInstance.id);
  assert.equal(repeatedInstance.id, instance.id);
  await expectForbidden('Runner instance detail with ek', user.coding.runners.instances.get(agent.runner_profile_id, instance.id, options()));

  // Readiness polling belongs to this bounded acceptance test, not the SDK.
  const deadline = Date.now() + 180_000;
  for (;;) {
    const status = await client.coding.agents.getStatus(agent.id, undefined, options());
    if (status.status === 'ready') break;
    assert.ok(Date.now() < deadline, `Runner did not become ready; status=${status.status}.`);
    await delay(1500);
  }
  console.log('Coding live: Runner ready; validating workspace/session idempotency and attachments.');
  const workspaceInput = {name: marker, is_default: false, custom_data: {sdk_live_test: marker}};
  const workspaceKey = `${marker}-workspace`;
  cleanup(`workspaces for temporary Agent ${agent.id}`, async () => {
    const workspaces = (await client.coding.workspaces.list(agent.id, options())).workspaces;
    for (const item of workspaces.filter(item => codingResources.workspaceIds.includes(item.id) || item.custom_data?.sdk_live_test === marker)) {
      track(codingResources.workspaceIds, item.id);
      await client.coding.workspaces.delete(agent.id, item.id, options());
    }
    assert.ok(!(await client.coding.workspaces.list(agent.id, options())).workspaces.some(w => codingResources.workspaceIds.includes(w.id)));
  });
  const workspace = await client.coding.workspaces.create(agent.id, workspaceInput, {...options(), idempotencyKey: workspaceKey});
  track(codingResources.workspaceIds, workspace.id);
  const repeatedWorkspace = await client.coding.workspaces.create(agent.id, workspaceInput, {...options(), idempotencyKey: workspaceKey});
  track(codingResources.workspaceIds, repeatedWorkspace.id);
  assert.equal(repeatedWorkspace.id, workspace.id);
  assert.equal((await client.coding.workspaces.get(agent.id, workspace.id, options())).name, marker);
  await client.coding.workspaces.update(agent.id, workspace.id, {name: `${marker}-updated`}, options());
  assert.equal((await client.coding.workspaces.get(agent.id, workspace.id, options())).name, `${marker}-updated`);
  const rules = '# SDK live test\nReply briefly. Do not run tools, read or modify files, or make network requests.\n';
  await client.coding.workspaces.updateAgentsMarkdown(agent.id, workspace.id, {content: rules}, options());
  assert.equal((await client.coding.workspaces.getAgentsMarkdown(agent.id, workspace.id, options())).content, rules);
  assert.ok(Array.isArray((await client.coding.repositories.list(agent.id, workspace.id, options())).repositories));
  const catalog = await client.coding.models.list({agent_id: agent.id}, options());
  assert.ok(catalog.models.length > 0, 'The runner must return a model catalog.');
  const sessionInput = {workspace_id: workspace.id, title: marker};
  const sessionKey = `${marker}-session`;
  cleanup(`Coding sessions for temporary Agent ${agent.id}`, async () => {
    for (let page = 1; ; page++) {
      assert.ok(page <= 100, 'Session cleanup pagination must terminate.');
      const result = await client.coding.sessions.list({agent_id: agent.id, page: String(page), page_size: '100'}, options());
      for (const item of result.sessions.filter(item => item.agent_id === agent.id
        && (codingResources.sessionIds.includes(item.id) || (item.title === marker && codingResources.workspaceIds.includes(item.workspace_id))))) {
        track(codingResources.sessionIds, item.id);
      }
      if (!result.has_more) break;
    }
    for (const id of codingResources.sessionIds) {
      try {
        const current = await client.coding.sessions.get(id, options());
        if (current.status !== 'archived') assert.equal((await client.coding.sessions.archive(id, options())).status, 'archived');
        assert.equal((await client.coding.sessions.get(id, options())).status, 'archived');
      } catch (error) {
        // Archived sessions can be hidden by the service's read filter.
        if (!(error instanceof ZAIClientError && error.status === 404)) throw error;
      }
    }
  });
  const session = await client.coding.sessions.create(agent.id, sessionInput, {...options(), idempotencyKey: sessionKey});
  track(codingResources.sessionIds, session.id);
  const repeatedSession = await client.coding.sessions.create(agent.id, sessionInput, {...options(), idempotencyKey: sessionKey});
  track(codingResources.sessionIds, repeatedSession.id);
  assert.equal(repeatedSession.id, session.id);
  assert.equal((await client.coding.sessions.get(session.id, options())).id, session.id);
  assert.ok((await client.coding.sessions.list({agent_id: agent.id}, options())).sessions.some(s => s.id === session.id));
  await client.coding.sessions.getTools(session.id, options());
  await client.coding.interactions.list(session.id, undefined, options());
  assert.equal((await client.coding.agents.getStatus(agent.id, {session_id: session.id}, options())).status, 'ready');
  const text = 'ZAI SDK 0.3.0 live attachment — 你好\n';
  const file = await client.coding.sessions.uploadFile(session.id, {name: 'sdk-live.txt'}, new Blob([text], {type: 'text/plain'}), options());
  track(codingResources.fileIds, file.id);
  assert.equal(file.size, new TextEncoder().encode(text).byteLength);
  assert.equal(await (await client.coding.sessions.downloadFile(session.id, {file_id: file.id}, options())).text(), text);
  await expectForbidden('Coding original file download with ak', admin.coding.sessions.downloadFile(session.id, {file_id: file.id}, options()));
  const empty = await client.coding.sessions.uploadFile(session.id, {name: 'sdk-empty.txt'}, new Blob(), options());
  track(codingResources.fileIds, empty.id);
  assert.equal(empty.size, 0);
  assert.equal((await client.coding.sessions.downloadFile(session.id, {file_id: empty.id}, options())).size, 0);
  await client.coding.sessions.listFiles(session.id, undefined, options());
  const link = await client.coding.sessions.createDownloadLink(session.id, {file_id: file.id}, options());
  const download = await fetch(new URL(link.url, baseUrl), {signal: AbortSignal.timeout(30_000)});
  assert.equal(download.status, 200);
  assert.equal(await download.text(), text);
  const consumed = await fetch(new URL(link.url, baseUrl), {signal: AbortSignal.timeout(30_000)});
  assert.ok(!consumed.ok, 'A single-use download link must not work twice.');
  await consumed.body?.cancel();
  t.diagnostic('Blob, zero-byte upload, user-only download and single-use download link passed; link URLs are not logged.');
  console.log('Coding live: starting one minimal Turn and observing its persisted events.');
  const turn = await client.coding.turns.start(session.id, {
    content: 'Reply with exactly OK. Do not run any tools or commands. Do not read or modify any files.', client_turn_id: marker,
    tools: {version: 1, tools: [], servers: {}}, attachment_ids: [file.id],
  }, options());
  track(codingResources.turnIds, turn.id);
  let terminal = false;
  cleanup(`turn ${turn.id}`, async () => {
    if (!terminal) await client.coding.turns.cancel(session.id, turn.id, options());
  });
  const events = [];
  let message = '';
  let afterSeq = '0';
  const streamOptions = options(90_000);
  while (!terminal) {
    for await (const event of await client.coding.events.stream(session.id, {after_seq: afterSeq}, streamOptions)) {
      if (event.data.seq <= Number(afterSeq)) continue;
      events.push(event);
      if (event.data.turn_id === turn.id && event.data.type === 'message.delta' && typeof event.data.payload.text === 'string') message += event.data.payload.text;
      afterSeq = String(event.data.seq);
      if (event.data.turn_id === turn.id && ['turn.completed', 'turn.failed', 'turn.canceled'].includes(event.data.type)) {
        terminal = true;
        break;
      }
    }
    if (!terminal) await delay(1000, undefined, {signal: streamOptions.signal});
  }
  assert.ok(terminal, 'Coding must produce a terminal turn event.');
  const final = await client.coding.turns.get(session.id, turn.id, options());
  assert.equal(final.status, 'completed', 'Coding turn must complete successfully.');
  assert.ok(final.assistant_content.trim(), 'Coding turn must contain a response.');
  assert.ok(message.trim(), 'Coding message.delta payload.text must contain a response.');
  const replay = await client.coding.events.list(session.id, {after_seq: '0', limit: '100'}, options());
  assert.ok(replay.events.some(e => e.type === 'turn.completed' && e.turn_id === turn.id));
  const first = events[0]!;
  const resumed = await client.coding.events.stream(session.id, {after_seq: String(first.data.seq)}, options());
  try {
    const next = await resumed.next();
    assert.ok(!next.done, 'Cursor resumption must replay an existing event.');
    assert.ok(next.value.data.seq > first.data.seq, 'after_seq must resume after the saved cursor.');
  } finally {
    await resumed.return?.();
  }
  t.diagnostic(`Coding turn completed; ${events.length} SSE events, persisted replay and cursor resumption passed. Session history and instance volumes follow service retention semantics.`);
});
