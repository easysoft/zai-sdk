// Run explicitly: node --env-file=.env.local --import tsx --test tests/live-migration.ts
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
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
const tracedFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const pathname = new URL(request.url).pathname.slice(url.pathname.replace(/\/$/, '').length);
  const operation = ZAI_OPERATIONS.find(op => op.method.toUpperCase() === request.method
    && new RegExp(`^${op.path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, '[^/]+')}$`).test(pathname));
  const start = Date.now();
  const response = await fetch(request);
  requests.push({method: request.method, path: operation?.path ?? pathname,
    token: request.headers.get('authorization')?.startsWith('Bearer ak-') ? 'ak' : 'ek', status: response.status, ms: Date.now() - start});
  return response;
};
const client = createZAIClient({baseUrl, auth: {mode: 'auto', ...credentials}, fetch: tracedFetch});
const getAdmin = createZAITokenProvider({credentials});
const getUser = createZAITokenProvider({credentials, tokenType: 'user', baseUrl, fetch: tracedFetch});
const admin = createZAIClient({baseUrl, getToken: getAdmin, fetch: tracedFetch});
const user = createZAIClient({baseUrl, getToken: getUser, fetch: tracedFetch});

function safeError(error: unknown): Error {
  if (error instanceof ZAIClientError) {
    return new Error(`${error.method ?? ''} ${error.path ?? ''}: ${error.code}, HTTP ${error.status ?? 'none'}`);
  }
  return new Error(error instanceof Error ? error.message : 'Live check failed.');
}

type Cleanup = (name: string, run: () => Promise<unknown>) => void;
function live(name: string, run: (t: TestContext, cleanup: Cleanup) => Promise<void>) {
  test(name, {timeout: 240_000}, async t => {
    const cleanups: {name: string; run: () => Promise<unknown>}[] = [];
    const errors: Error[] = [];
    try { await run(t, (name, run) => cleanups.push({name, run})); }
    catch (error) { errors.push(safeError(error)); }
    finally {
      for (const cleanup of cleanups.reverse()) {
        try { await cleanup.run(); t.diagnostic(`Cleaned up ${cleanup.name}.`); }
        catch (error) { errors.push(new Error(`Cleanup ${cleanup.name}: ${safeError(error).message}`)); }
      }
    }
    results.push({name, pass: !errors.length, ...errors.length && {error: errors.map(e => e.message).join('; ')}});
    if (errors.length) throw new AggregateError(errors, errors.map(e => e.message).join('; '));
  });
}

after(() => {
  mkdirSync('test-results', {recursive: true});
  writeFileSync('test-results/live-migration.json', JSON.stringify({date: new Date().toISOString(), baseUrl, results, requests}, null, 2));
});

live('live read-only ak/ek permissions and getToken(admin)', async t => {
  const shared: [string, (c: ZAIClient) => Promise<unknown>][] = [
    ['agents', c => c.agents.list(options())],
    ['sessions', c => c.sessions.list({page_size: 1}, options())],
    ['chat.conversations', c => c.chat.conversations.list({page_size: 1}, options())],
    ['coding.sessions', c => c.coding.sessions.list({page_size: '1'}, options())],
    ['memories', c => c.memories.list(options())],
    ['qa', c => c.qa.list(options())],
    ['skills', c => c.skills.list(options())],
  ];
  const restricted: [string, (c: ZAIClient) => Promise<unknown>][] = [
    ['models', c => c.settings.models.list(options())],
    ['channels', c => c.settings.channels.list(options())],
    ['signing secret', c => c.settings.signingSecret.get(options())],
    ['runners', c => c.coding.runners.list(options())],
    ['memory queue', c => c.memories.getEmbeddingQueueStats(options())],
  ];
  for (const [name, call] of shared) {
    await call(admin); await call(user);
    t.diagnostic(`${name}: ak and ek accepted.`);
  }
  for (const [name, call] of restricted) {
    await call(admin);
    await assert.rejects(call(user), error => error instanceof ZAIClientError && error.status === 403);
    t.diagnostic(`${name}: ak accepted; ek rejected with 403.`);
  }
  const flags: boolean[] = [];
  const explicit = createZAIClient({baseUrl, fetch: tracedFetch, getToken: admin => {
    flags.push(admin);
    return admin ? getAdmin() : getUser();
  }});
  await explicit.agents.list(options());
  await explicit.settings.models.list(options());
  await explicit.coding.runners.list(options());
  assert.deepEqual(flags, [false, true, true]);
  const diagnosis = await client.doctor();
  assert.ok(diagnosis.pass, 'Read-only doctor must pass.');
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
  const runner = (await client.coding.runners.list(options())).runners.find(r => r.online && r.providers.includes('codex'));
  assert.ok(runner, 'An online Codex runner is required.');
  const {agent} = await client.agents.create({name: marker, type: 'runner', runner_id: runner.runner_id, is_default: false, skills: []}, options());
  cleanup(`runner Agent ${agent.id}`, async () => {
    await client.agents.delete(agent.id, undefined, options());
    assert.ok(!(await client.agents.list(options())).agents.some(a => a.id === agent.id && a.status === 'active'));
  });
  assert.equal((await client.agents.get(agent.id, options())).agent.type, 'runner');
  const workspace = await client.coding.workspaces.create(agent.id, {name: marker, is_default: false, custom_data: {sdk_live_test: marker}}, options());
  cleanup(`workspace ${workspace.id}`, async () => {
    await client.coding.workspaces.delete(agent.id, workspace.id, options());
    assert.ok(!(await client.coding.workspaces.list(agent.id, options())).workspaces.some(w => w.id === workspace.id));
  });
  assert.equal((await client.coding.workspaces.get(agent.id, workspace.id, options())).name, marker);
  await client.coding.workspaces.update(agent.id, workspace.id, {name: `${marker}-updated`}, options());
  assert.equal((await client.coding.workspaces.get(agent.id, workspace.id, options())).name, `${marker}-updated`);
  const rules = '# SDK live test\nReply briefly. Do not run tools, read or modify files, or make network requests.\n';
  await client.coding.workspaces.updateAgentsMarkdown(agent.id, workspace.id, {content: rules}, options());
  assert.equal((await client.coding.workspaces.getAgentsMarkdown(agent.id, workspace.id, options())).content, rules);
  assert.ok(Array.isArray((await client.coding.repositories.list(agent.id, workspace.id, options())).repositories));
  const catalog = await client.coding.models.list({provider: 'codex', agent_id: agent.id, runner_id: runner.runner_id}, options());
  assert.ok(catalog.models.length > 0, 'The runner must return a model catalog.');
  const session = await client.coding.sessions.create(agent.id, {workspace_id: workspace.id, provider: 'codex', runner_id: runner.runner_id, title: marker}, options());
  cleanup(`Coding session ${session.id}`, async () => {
    assert.equal((await client.coding.sessions.archive(session.id, options())).status, 'archived');
  });
  assert.equal((await client.coding.sessions.get(session.id, options())).id, session.id);
  assert.ok((await client.coding.sessions.list({agent_id: agent.id}, options())).sessions.some(s => s.id === session.id));
  await client.coding.sessions.getTools(session.id, options());
  await client.coding.interactions.list(session.id, undefined, options());
  const turn = await client.coding.turns.start(session.id, {
    content: 'Reply with exactly OK. Do not run any tools or commands. Do not read or modify any files.', client_turn_id: marker,
    tools: {version: 1, tools: [], servers: {}},
  }, options());
  let terminal = false;
  cleanup(`turn ${turn.id}`, async () => {
    if (!terminal) await client.coding.turns.cancel(session.id, turn.id, options());
  });
  const events = [];
  for await (const event of await client.coding.events.stream(session.id, {after_seq: '0'}, options(90_000))) {
    events.push(event);
    if (event.data.turn_id === turn.id && ['turn.completed', 'turn.failed', 'turn.canceled'].includes(event.data.type)) {
      terminal = true;
      break;
    }
  }
  assert.ok(terminal, 'Coding must produce a terminal turn event.');
  const final = await client.coding.turns.get(session.id, turn.id, options());
  assert.equal(final.status, 'completed', 'Coding turn must complete successfully.');
  assert.ok(final.assistant_content.trim(), 'Coding turn must contain a response.');
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
  t.diagnostic(`Coding turn completed; ${events.length} SSE events, persisted replay and cursor resumption passed.`);
});
