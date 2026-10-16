import {expect, expectTypeOf, it} from 'vitest';
import {
  createZAIClient, createZAITokenProvider,
  type ZAIClient, type AgentsListResponse, type MessagesSendResponse,
  type SettingsModelsListResponse, type SessionsDownloadFileResponse, type ZAIStreamEvent,
  type CodingSessionsCreateInput, type CodingEventsStreamResponse, type ZAICodingStreamEvent, type ZAIRunnerStatusStreamEvent,
  type CodingAgentsStreamStatusResponse, type CodingSessionsUploadFileInput, type MessagesSendInput,
  type ChatMessagesSendResponse, type ChatSendResponse, type FilesExtractInput,
  type ZAITokenProvider, type ZAIUploadFile, type ZAIDoctorResult, type ZAIDoctorDetail,
} from '../src/index.js';

/** Compiled by tsc but never invoked: invalid calls must remain type errors. */
function assertPublicAPI(client: ZAIClient) {
  void client.doctor();
  void client.doctor({chat: true, agentId: 'agent', model: 'model', timeoutMs: 10_000, onChange(detail) {
    expectTypeOf(detail).toEqualTypeOf<ZAIDoctorDetail>();
  }});
  void client.agents.create({name: '助手', type: 'custom', skills: ['skill']});
  void client.agents.create({name: '编程助手', type: 'runner', runner_profile_id: 'profile'}, {tokenType: 'admin'});
  void client.coding.agents.create({name: '编程助手'});
  void client.agents.get('agent', {signal: new AbortController().signal, headers: {'x-trace': 'id'}});
  void client.sessions.list({model: 'historical/model', page: 2, page_size: 20});
  void client.settings.models.list();
  void client.settings.models.list({tokenType: 'admin'});
  void client.settings.models.get('3');
  void client.sessions.update('session', {custom_data: null});
  void client.coding.repositories.update('agent', 'workspace', 'repo', {custom_data: null});
  void client.coding.workspaces.create('agent', {name: '工作区'});
  void client.coding.sessions.create('agent', {workspace_id: 'workspace', mode: 'default', plan_mode: true} satisfies CodingSessionsCreateInput, {idempotencyKey: 'session-create'});
  void client.coding.sessions.archive('session');
  void client.coding.events.stream('session', {after_seq: '12'}, {signal: new AbortController().signal});
  void client.coding.agents.streamStatus('agent');
  void client.coding.agents.getStatus('agent', {external_user_id: 'user'}, {tokenType: 'admin'});
  void client.coding.agents.ensureRunnerInstance('agent', {}, {idempotencyKey: 'ensure-runner'});
  void client.coding.models.list({agent_id: 'agent'});
  void client.coding.modes.list({agent_id: 'agent'});
  void client.coding.turns.start('session', {content: 'Fix the regression'});
  void client.sessions.create('agent', {workspace_id: 'workspace'});
  void client.messages.send('session', {
    content: [{type: 'input_text', text: 'hello'}, {type: 'input_image', path: 'a.png'}],
    tools: [{type: 'function'}], tool_execution_mode: 'schema-only',
  });
  void client.messages.stream('session', {messages: [{role: 'user', content: 'hi'}]});
  void client.messages.send('session', {content: [
    {type: 'input_image', file_id: 'file'}, {type: 'input_file', path: 'file.txt'},
    {type: 'input_file', file_id: 'file', path: 'file.txt'},
  ]});
  void client.chat.messages.send('conversation', {content: 'hi', attachments: [{type: 'image', url: 'image.png'}], tool_execution_mode: 'schema-only'});
  void client.chat.messages.stream('conversation', {content: 'hi'});
  void client.chat.send({content: 'hi'});
  void client.chat.stream({content: 'hi'});
  void client.sessions.downloadFile('session', {path: 'file.txt'});
  void client.sessions.downloadFile('session', {file_id: 'file'});
  void client.coding.sessions.uploadFile('session', {name: 'file.txt'}, new Blob(['text']));
  void client.coding.sessions.uploadFile('session', {name: 'empty.txt'});
  void client.coding.sessions.downloadFile('session', {path: 'file.txt'});
  void client.coding.sessions.downloadFile('session', {file_id: 'file'});
  void client.coding.sessions.createDownloadLink('session', {file_id: 'file'});
  void client.coding.toolCalls.resolve('session', 'tool', {output: null});
  void client.coding.toolCalls.resolve('session', 'tool', {error: {code: 'failed', message: 'Failed'}});
  void client.sessions.uploadFile('session', {file: new Blob(['text'])});
  void client.sessions.uploadFile('session', {file: new File(['x'], 'x.txt'), path: 'x.txt'});
  void client.sessions.uploadFile('session', {file: {blob: new Blob(['x']), filename: 'x.txt'}, path: 'x.txt'});
  void client.files.extract({file: {blob: new Blob(['text']), filename: 'readme.txt'}});
  // The original contract does not require file, despite its descriptive text.
  void client.files.extract({} satisfies FilesExtractInput);
  void client.qa.create({question: 'What?', answer: 'This.'});
  void client.skills.validateBundle({files: [{path: 'SKILL.md', content: '# Test'}]});
  void client.skills.validateBundle({bundle: new Blob(['zip']), changelog: null});
  void client.skills.publishRevision('skill', {bundle: {blob: new Blob(), filename: 'skill.zip'}, changelog: 'v1'});
  createZAITokenProvider({credentials: {appID: 'app', appKey: 'key', userID: 'user'}, expiresInSeconds: 1000});
  createZAITokenProvider({credentials: {appID: 'app', appKey: 'key', userID: 'user'}, tokenType: 'user', baseUrl: 'https://zai.test/v1/zai'});
  createZAITokenProvider({fetchToken: async () => ({token: 'token', expiresAt: 1000}), refreshBeforeSeconds: 10});
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', auth: {mode: 'auto', appID: 'app', appKey: 'key', userID: 'user', userName: '用户😀'}});
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: admin => {
    expectTypeOf(admin).toEqualTypeOf<boolean>();
    return admin ? 'ak-token' : 'ek-token';
  }});
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: async admin => admin ? 'ak-token' : 'ek-token'});
  // Existing no-argument callbacks and fixed-type providers remain compatible.
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'ek-token'});
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: createZAITokenProvider({credentials: {appID: 'a', appKey: 'k', userID: 'u'}})});

  // @ts-expect-error The chat probe is an explicit boolean option.
  void client.doctor({chat: 'true'});
  // @ts-expect-error Agent creation requires a name.
  void client.agents.create({type: 'custom'});
  // @ts-expect-error The executor type has been replaced by runner.
  void client.agents.create({name: 'old', type: 'executor'});
  // @ts-expect-error IDs are separate string parameters.
  void client.agents.get(3);
  // @ts-expect-error Coding downloads require one file selector.
  void client.coding.sessions.downloadFile('session');
  // @ts-expect-error Coding downloads reject missing file selectors.
  void client.coding.sessions.downloadFile('session', {});
  // @ts-expect-error Coding downloads reject two selectors.
  void client.coding.sessions.downloadFile('session', {file_id: 'file', path: 'file.txt'});
  // @ts-expect-error Download links require a selector body.
  void client.coding.sessions.createDownloadLink('session');
  // @ts-expect-error Download links reject missing selectors.
  void client.coding.sessions.createDownloadLink('session', {});
  // @ts-expect-error Download links reject two selectors.
  void client.coding.sessions.createDownloadLink('session', {file_id: 'file', path: 'file.txt'});
  // @ts-expect-error Tool results require an explicit body.
  void client.coding.toolCalls.resolve('session', 'tool');
  // @ts-expect-error Tool results require output or error.
  void client.coding.toolCalls.resolve('session', 'tool', {});
  // @ts-expect-error Tool results cannot supply output and error together.
  void client.coding.toolCalls.resolve('session', 'tool', {output: null, error: {code: 'failed', message: 'Failed'}});
  // @ts-expect-error Raw uploads require Blob data.
  void client.coding.sessions.uploadFile('session', {name: 'file'}, {file: new Blob()});
  // @ts-expect-error Raw uploads require a name query.
  void client.coding.sessions.uploadFile('session', {});
  // @ts-expect-error Image inputs require a file_id or legacy path.
  void client.messages.send('session', {content: [{type: 'input_image'}]});
  // @ts-expect-error File inputs require a file_id or legacy path.
  void client.messages.send('session', {content: [{type: 'input_file'}]});
  // @ts-expect-error Attachment items cannot widen to unknown.
  void client.messages.send('session', {content: [42]});
  // @ts-expect-error Legacy runner identifiers are removed.
  void client.agents.create({name: 'old', type: 'runner', runner_id: 'runner'});
  // @ts-expect-error Session creation no longer accepts runner overrides.
  void client.coding.sessions.create('agent', {workspace_id: 'workspace', runner_id: 'runner'});
  // @ts-expect-error Session creation no longer accepts provider overrides.
  void client.coding.sessions.create('agent', {workspace_id: 'workspace', provider: 'codex'});
  // @ts-expect-error Model lookup requires an agent.
  void client.coding.models.list({provider: 'codex'});
  // @ts-expect-error Paths must be strings, not an untyped query bag.
  void client.sessions.downloadFile('session', {path: 42});
  // @ts-expect-error Pagination uses numeric values.
  void client.sessions.list({page: '2'});
  // @ts-expect-error Legacy top-level model discovery is removed.
  void client.models.list();
  // @ts-expect-error Legacy top-level executor keys are removed.
  void client.executor.getPublicKey('agent');
  // @ts-expect-error Legacy top-level workspaces are removed.
  void client.workspaces.list('agent');
  // @ts-expect-error Legacy top-level repositories are removed.
  void client.repositories.list('agent', 'workspace');
  // @ts-expect-error Repository download has no replacement endpoint.
  void client.coding.repositories.downloadFile('agent', 'workspace', 'repo', {path: 'x'});
  // @ts-expect-error Model management has no historical all query.
  void client.settings.models.list({all: 'true'});
  // @ts-expect-error A model filter must identify a model, not carry a model object.
  void client.sessions.list({model: {id: 'model'}});
  // @ts-expect-error Repository updates only expose declared fields.
  void client.coding.repositories.update('agent', 'workspace', 'repo', {branch: 'other'});
  // @ts-expect-error executor_provider was removed from ordinary session creation.
  void client.sessions.create('agent', {executor_provider: 'codex'});
  // @ts-expect-error Ordinary session file listing no longer accepts a path filter.
  void client.sessions.listFiles('session', {path: 'src'});
  // @ts-expect-error JSON and SSE request modes are selected by the public method.
  void client.messages.send('session', {stream: true});
  // @ts-expect-error Streaming callers cannot override its protocol mode either.
  void client.messages.stream('session', {stream: false});
  // @ts-expect-error Chat JSON method also fixes stream=false.
  void client.chat.messages.send('conversation', {stream: true});
  // @ts-expect-error Chat SSE method also fixes stream=true.
  void client.chat.messages.stream('conversation', {stream: false});
  // @ts-expect-error Convenience Chat JSON method also fixes stream=false.
  void client.chat.send({stream: true});
  // @ts-expect-error Convenience Chat SSE method also fixes stream=true.
  void client.chat.stream({stream: false});
  // @ts-expect-error Coding turns require content.
  void client.coding.turns.start('session', {});
  // @ts-expect-error Upload file objects require a Blob and a name.
  void client.sessions.uploadFile('session', {file: {blob: new Blob()}, path: 'x'});
  // @ts-expect-error A bare string is not binary upload data.
  void client.skills.validateBundle({bundle: 'archive.zip'});
  // @ts-expect-error Extract accepts binary upload data, not a file path string.
  void client.files.extract({file: 'readme.txt'});
  // @ts-expect-error File-only extraction exposes no upload path field.
  void client.files.extract({file: new Blob(), path: 'readme.txt'});
  // @ts-expect-error Token sources are mutually exclusive.
  createZAITokenProvider({credentials: {appID: 'a', appKey: 'k', userID: 'u'}, fetchToken: () => ({token: 't', expiresAt: 1000})});
  // @ts-expect-error A backend source supplies its expiry; a local lifetime cannot override it.
  createZAITokenProvider({fetchToken: () => ({token: 't', expiresAt: 1000}), expiresInSeconds: 1000});
  // @ts-expect-error External token acquisition must include the expiration timestamp.
  createZAITokenProvider({fetchToken: () => 'token'});
  // @ts-expect-error User providers need a root URL to acquire the signing secret.
  createZAITokenProvider({credentials: {appID: 'a', appKey: 'k', userID: 'u'}, tokenType: 'user'});
  // @ts-expect-error A client always needs an explicit token source or auto auth.
  createZAIClient({baseUrl: 'https://zai.test/v1/zai'});
  // @ts-expect-error Automatic and caller-supplied token sources are mutually exclusive.
  createZAIClient({baseUrl: 'https://zai.test/v1/zai', getToken: () => 'token', auth: {mode: 'auto', appID: 'a', appKey: 'k', userID: 'u'}});
}

it('exports precise nested request, response, upload, and asynchronous stream types', () => {
  expect(assertPublicAPI).toBeTypeOf('function');
  expectTypeOf<typeof assertPublicAPI>().parameter(0).toEqualTypeOf<ZAIClient>();
  expectTypeOf<ReturnType<typeof createZAIClient>>().toEqualTypeOf<ZAIClient>();
  expectTypeOf<ReturnType<ZAIClient['doctor']>>().toEqualTypeOf<Promise<ZAIDoctorResult>>();
  expectTypeOf<ReturnType<ZAIClient['agents']['list']>>().toEqualTypeOf<Promise<AgentsListResponse>>();
  expectTypeOf<ReturnType<ZAIClient['settings']['models']['list']>>().toEqualTypeOf<Promise<SettingsModelsListResponse>>();
  expectTypeOf<ReturnType<ZAIClient['messages']['send']>>().toEqualTypeOf<Promise<MessagesSendResponse>>();
  expectTypeOf<ReturnType<ZAIClient['chat']['messages']['send']>>().toEqualTypeOf<Promise<ChatMessagesSendResponse>>();
  expectTypeOf<ReturnType<ZAIClient['chat']['send']>>().toEqualTypeOf<Promise<ChatSendResponse>>();
  expectTypeOf<ReturnType<ZAIClient['messages']['stream']>>().toEqualTypeOf<Promise<AsyncIterableIterator<ZAIStreamEvent>>>();
  expectTypeOf<ReturnType<ZAIClient['chat']['messages']['stream']>>().toEqualTypeOf<Promise<AsyncIterableIterator<ZAIStreamEvent>>>();
  expectTypeOf<ReturnType<ZAIClient['chat']['stream']>>().toEqualTypeOf<Promise<AsyncIterableIterator<ZAIStreamEvent>>>();
  expectTypeOf<ReturnType<ZAIClient['coding']['events']['stream']>>().toEqualTypeOf<Promise<CodingEventsStreamResponse>>();
  expectTypeOf<CodingEventsStreamResponse>().toEqualTypeOf<AsyncIterableIterator<ZAICodingStreamEvent>>();
  expectTypeOf<CodingAgentsStreamStatusResponse>().toEqualTypeOf<AsyncIterableIterator<ZAIRunnerStatusStreamEvent>>();
  expectTypeOf<CodingSessionsUploadFileInput>().toEqualTypeOf<Blob>();
  expectTypeOf<NonNullable<MessagesSendInput['content']>[number]>().not.toBeUnknown();
  expectTypeOf<SessionsDownloadFileResponse>().toEqualTypeOf<Blob>();
  expectTypeOf<ReturnType<typeof createZAITokenProvider>>().toEqualTypeOf<ZAITokenProvider>();
  expectTypeOf<ZAIUploadFile>().toEqualTypeOf<Blob | {blob: Blob; filename: string}>();
});
