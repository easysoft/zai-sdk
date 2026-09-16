import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import test from 'node:test';
import {createZAIClient, createZAITokenProvider, ZAIClientError} from '../src/index.js';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}; copy .env.example to .env.local and configure the live test.`);
  return value;
}

function safeError(error: unknown): Error {
  // Never include request headers, response bodies, token values or a cause tree.
  if (error instanceof ZAIClientError) return new Error(`Live API request failed: ${error.code}${error.status ? ` (HTTP ${error.status})` : ''}.`);
  return new Error(error instanceof Error ? error.message : 'Live test failed.');
}

test('live ZAI authentication renewal, session, messages, SSE and files', {timeout: 300_000}, async t => {
  const liveUrl = new URL(required('TEST_ZAI_BASE_URL'));
  // Existing local fixtures may contain only the server origin. Keep this
  // compatibility adapter outside the public SDK's explicit API-root contract.
  if (liveUrl.pathname === '/') liveUrl.pathname = '/v8';
  const baseUrl = liveUrl.href;
  const credentials = {appID: required('TEST_ZAI_APP_ID'), appKey: required('TEST_ZAI_APP_KEY'), userID: required('TEST_ZAI_USER_ID')};
  const client = createZAIClient({baseUrl, getToken: createZAITokenProvider({credentials})});
  const requestOptions = () => ({signal: AbortSignal.timeout(30_000)});
  let sessionID: string | undefined;
  let failure: unknown;
  try {
    const shortProvider = createZAITokenProvider({credentials, expiresInSeconds: 5, refreshBeforeSeconds: 3});
    const sentTokens: string[] = [];
    const renewalClient = createZAIClient({baseUrl, getToken: shortProvider, fetch: async request => {
      sentTokens.push(new Headers(request instanceof Request ? request.headers : undefined).get('authorization') ?? '');
      return fetch(request);
    }});
    const {agents} = await renewalClient.agents.list(requestOptions());
    await delay(2200);
    const {models} = await renewalClient.models.list(undefined, requestOptions());
    assert.ok(Array.isArray(models), 'Model listing must return an array.');
    assert.ok(sentTokens.length === 2 && sentTokens.every(Boolean), 'Both live requests must carry authorization.');
    assert.ok(sentTokens[0] !== sentTokens[1], 'The next live request must use a renewed token.');
    sentTokens.length = 0;
    t.diagnostic('Authenticated reads succeeded across the token renewal boundary.');

    const explicitAgentID = process.env.TEST_ZAI_AGENT_ID?.trim();
    const eligible = agents.filter(agent => agent.status === 'active' && agent.type === 'custom');
    const agent = explicitAgentID ? eligible.find(candidate => candidate.id === explicitAgentID)
      : eligible.find(candidate => candidate.is_default) ?? eligible[0];
    assert.ok(agent, explicitAgentID ? 'TEST_ZAI_AGENT_ID must identify an active custom Agent.' : 'An active custom Agent is required for the live test.');
    const marker = `zai-sdk-live-${new Date().toISOString()}-${randomUUID().slice(0, 8)}`;
    const created = await client.sessions.create(agent.id, {
      title: marker, category: 'zai-sdk-live', skills: [],
      prompt: 'This is an SDK integration test. Answer very briefly. Do not use tools, skills, or external resources.',
      reference_settings: {memories: {collections: []}}, custom_data: {sdk_live_test: marker},
    }, requestOptions());
    sessionID = created.session.id;
    assert.ok(sessionID, 'Session creation must return an ID.');
    assert.equal((await client.sessions.get(sessionID, requestOptions())).session.title, marker);
    const page = await client.sessions.list({agent_id: agent.id, category: 'zai-sdk-live', page: 1, page_size: 100}, requestOptions());
    assert.ok(page.sessions.some(session => session.id === sessionID), 'The temporary session must be listed.');
    await client.sessions.update(sessionID, {title: `${marker}-updated`}, requestOptions());
    assert.equal((await client.sessions.get(sessionID, requestOptions())).session.title, `${marker}-updated`);

    const message = await client.messages.send(sessionID, {
      content: [{type: 'input_text', text: 'Reply with exactly OK. Do not call any tools.'}], tools: [], tool_execution_mode: 'schema-only',
    }, {signal: AbortSignal.timeout(60_000)});
    assert.ok(typeof message.content === 'string' && message.content.trim().length > 0, 'JSON message must contain a reply.');
    let dataCount = 0;
    let completed = false;
    const stream = await client.messages.stream(sessionID, {
      content: [{type: 'input_text', text: 'Reply with exactly OK again. Do not call any tools.'}], tools: [], tool_execution_mode: 'schema-only',
    }, {signal: AbortSignal.timeout(60_000)});
    for await (const event of stream) {
      if (event.type === 'done') completed = true;
      else dataCount++;
    }
    assert.ok(completed && dataCount > 0, 'SSE must produce data and a completion sentinel.');
    const history = await client.messages.list(sessionID, requestOptions());
    assert.ok(history.messages.length >= 2, 'Both message turns must appear in history.');

    const path = `sdk-test/${randomUUID()}.txt`;
    const content = 'ZAI SDK live test — 你好\n';
    await client.sessions.uploadFile(sessionID, {path, file: {blob: new Blob([content], {type: 'text/plain'}), filename: 'sdk-test.txt'}}, requestOptions());
    await client.sessions.listFiles(sessionID, undefined, requestOptions());
    assert.equal(await (await client.sessions.downloadFile(sessionID, {path}, requestOptions())).text(), content);
    const reset = await client.sessions.resetContext(sessionID, requestOptions());
    assert.ok(typeof reset.message === 'string', 'Context reset must report a result.');
    assert.equal((await client.messages.list(sessionID, requestOptions())).messages.length, history.messages.length, 'Context reset must retain stored history.');
    t.diagnostic('Temporary session, JSON/SSE messages, history, file round trip and context reset succeeded.');
  } catch (error) {
    failure = safeError(error);
  } finally {
    if (sessionID) {
      try {
        await client.sessions.delete(sessionID, requestOptions());
        t.diagnostic('The temporary live-test session was deleted.');
      } catch (error) {
        const cleanupError = new Error(`Temporary session cleanup failed (session ${sessionID}): ${safeError(error).message}`);
        failure = failure ? new AggregateError([failure, cleanupError], 'Live test failed and its temporary session could not be deleted.') : cleanupError;
      }
    }
  }
  if (failure) throw failure;
});
