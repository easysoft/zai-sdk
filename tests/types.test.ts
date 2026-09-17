import {expect, expectTypeOf, it} from 'vitest';
import {
  createZAIClient, createZAITokenProvider,
  type ZAIClient, type AgentsListResponse, type MessagesSendResponse,
  type ModelsListResponse, type SessionsDownloadFileResponse, type ZAIStreamEvent,
  type ZAITokenProvider, type ZAIUploadFile, type ZAIDoctorResult, type ZAIDoctorDetail,
} from '../src/index.js';

/** Compiled by tsc but never invoked: invalid calls must remain type errors. */
function assertPublicAPI(client: ZAIClient) {
  void client.doctor();
  void client.doctor({chat: true, agentId: 'agent', model: 'model', timeoutMs: 10_000, onChange(detail) {
    expectTypeOf(detail).toEqualTypeOf<ZAIDoctorDetail>();
  }});
  // @ts-expect-error The chat probe is an explicit boolean option.
  void client.doctor({chat: 'true'});
  void client.agents.create({name: '助手', type: 'custom', skills: ['skill']});
  void client.agents.get('agent', {signal: new AbortController().signal, headers: {'x-trace': 'id'}});
  void client.sessions.list({model: 'historical/model', page: 2, page_size: 20});
  void client.models.list({all: 'true'});
  void client.models.list({all: '1'});
  void client.sessions.update('session', {custom_data: null});
  void client.repositories.update('agent', 'workspace', 'repo', {custom_data: null});
  void client.workspaces.create('agent', {name: '工作区'});
  void client.sessions.create('agent', {workspace_id: 'workspace', executor_provider: 'codex'});
  void client.messages.send('session', {
    content: [{type: 'input_text', text: 'hello'}, {type: 'input_image', path: 'a.png'}],
    tools: [{type: 'function'}], tool_execution_mode: 'schema-only',
  });
  void client.messages.stream('session', {messages: [{role: 'user', content: 'hi'}]});
  void client.sessions.downloadFile('session', {path: 'file.txt'});
  void client.sessions.uploadFile('session', {file: new File(['x'], 'x.txt'), path: 'x.txt'});
  void client.sessions.uploadFile('session', {file: {blob: new Blob(['x']), filename: 'x.txt'}, path: 'x.txt'});
  void client.skills.validateBundle({files: [{path: 'SKILL.md', content: '# Test'}]});
  void client.skills.validateBundle({bundle: new Blob(['zip']), changelog: null});
  void client.skills.publishRevision('skill', {bundle: {blob: new Blob(), filename: 'skill.zip'}, changelog: 'v1'});
  createZAITokenProvider({credentials: {appID: 'app', appKey: 'key', userID: 'user'}, expiresInSeconds: 1000});
  createZAITokenProvider({fetchToken: async () => ({token: 'token', expiresAt: 1000}), refreshBeforeSeconds: 10});

  // @ts-expect-error Agent creation requires a name.
  void client.agents.create({type: 'custom'});
  // @ts-expect-error IDs are separate string parameters.
  void client.agents.get(3);
  // @ts-expect-error A required file query cannot be omitted.
  void client.sessions.downloadFile('session');
  // @ts-expect-error Paths must be strings, not an untyped query bag.
  void client.sessions.downloadFile('session', {path: 42});
  // @ts-expect-error Pagination uses numeric values.
  void client.sessions.list({page: '2'});
  // @ts-expect-error The schema uses string flags for the historical model query.
  void client.models.list({all: true});
  // @ts-expect-error The all query only admits its documented flags.
  void client.models.list({all: 'false'});
  // @ts-expect-error A model filter must identify a model, not carry a model object.
  void client.sessions.list({model: {id: 'model'}});
  // @ts-expect-error Repository updates only expose the declared metadata field.
  void client.repositories.update('agent', 'workspace', 'repo', {branch: 'other'});
  // @ts-expect-error JSON and SSE request modes are selected by the public method.
  void client.messages.send('session', {stream: true});
  // @ts-expect-error Streaming callers cannot override its protocol mode either.
  void client.messages.stream('session', {stream: false});
  // @ts-expect-error Upload file objects require a Blob and a name.
  void client.sessions.uploadFile('session', {file: {blob: new Blob()}, path: 'x'});
  // @ts-expect-error A bare string is not binary upload data.
  void client.skills.validateBundle({bundle: 'archive.zip'});
  // @ts-expect-error Token sources are mutually exclusive.
  createZAITokenProvider({credentials: {appID: 'a', appKey: 'k', userID: 'u'}, fetchToken: () => ({token: 't', expiresAt: 1000})});
  // @ts-expect-error A backend source supplies its expiry; a local lifetime cannot override it.
  createZAITokenProvider({fetchToken: () => ({token: 't', expiresAt: 1000}), expiresInSeconds: 1000});
  // @ts-expect-error External token acquisition must include the expiration timestamp.
  createZAITokenProvider({fetchToken: () => 'token'});
  // @ts-expect-error A client always needs an explicit token source.
  createZAIClient({baseUrl: 'https://zai.test/v8'});
}

it('exports precise request, response, upload, and async streaming types', () => {
  expect(assertPublicAPI).toBeTypeOf('function');
  expectTypeOf<typeof assertPublicAPI>().parameter(0).toEqualTypeOf<ZAIClient>();
  expectTypeOf<ReturnType<typeof createZAIClient>>().toEqualTypeOf<ZAIClient>();
  expectTypeOf<ReturnType<ZAIClient['doctor']>>().toEqualTypeOf<Promise<ZAIDoctorResult>>();
  expectTypeOf<ReturnType<ZAIClient['agents']['list']>>().toEqualTypeOf<Promise<AgentsListResponse>>();
  expectTypeOf<ReturnType<ZAIClient['models']['list']>>().toEqualTypeOf<Promise<ModelsListResponse>>();
  expectTypeOf<ReturnType<ZAIClient['messages']['send']>>().toEqualTypeOf<Promise<MessagesSendResponse>>();
  expectTypeOf<ReturnType<ZAIClient['messages']['stream']>>().toEqualTypeOf<Promise<AsyncIterableIterator<ZAIStreamEvent>>>();
  expectTypeOf<SessionsDownloadFileResponse>().toEqualTypeOf<Blob>();
  expectTypeOf<ReturnType<typeof createZAITokenProvider>>().toEqualTypeOf<ZAITokenProvider>();
  expectTypeOf<ZAIUploadFile>().toEqualTypeOf<Blob | {blob: Blob; filename: string}>();
});
