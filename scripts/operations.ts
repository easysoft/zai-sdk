/** Stable public names. The generator rejects missing, extra, or duplicate operations. */
const agent = '/agents/{agent_id}';
const codingAgent = '/coding/agents/{agent_id}';
const workspace = `${codingAgent}/workspaces/{workspace_id}`;
const repo = `${workspace}/repos/{repository_id}`;
const session = '/sessions/{session_id}';
const skill = '/skills/{skill_id}';
const memory = '/memories/{id}';
const content = `${memory}/contents/{content_id}`;
const codingSession = '/coding/sessions/{session_id}';
const runner = '/coding/runners/{profile_id}';
const instance = `${runner}/instances/{instance_id}`;
const turn = `${codingSession}/turns/{turn_id}`;
const conversation = '/chat/conversations/{id}';
const authSource = 'https://zai-dev.sh.oop.cc/docs/authentication/app-api';
const specificationSource = (method: string, path: string) => `../zai-openapi.json#/paths/${path.replace(/~/g, '~0').replace(/\//g, '~1')}/${method}`;
const codingEventsSource = 'https://zai-dev.sh.oop.cc/docs/zai/coding/events';
const codingAPISource = 'https://zai-dev.sh.oop.cc/docs/zai/coding/api';

export type OperationMapping = readonly [group: string, name: string, method: string, path: string, auth: 'admin' | 'user' | 'user-only', source: string, streamName?: string, streamKind?: 'coding' | 'status'];

export const operations = [
  ['agents', 'list', 'get', '/agents', 'user', authSource],
  ['agents', 'create', 'post', '/agents', 'user', authSource],
  ['agents', 'get', 'get', agent, 'user', authSource],
  ['agents', 'update', 'put', agent, 'user', authSource],
  ['agents', 'delete', 'delete', agent, 'user', authSource],
  ['coding.keys', 'getPublic', 'get', `${codingAgent}/keys/public`, 'user-only', codingAPISource],
  ['coding.keys', 'rotate', 'post', `${codingAgent}/keys/rotate`, 'user-only', codingAPISource],
  ['coding.keys', 'ensure', 'post', `${codingAgent}/keys`, 'user-only', codingAPISource],
  ['coding.workspaces', 'getAgentsMarkdown', 'get', `${workspace}/AGENTS.md`, 'user', authSource],
  ['coding.workspaces', 'updateAgentsMarkdown', 'put', `${workspace}/AGENTS.md`, 'user', authSource],
  ['coding.workspaces', 'list', 'get', `${codingAgent}/workspaces`, 'user', authSource],
  ['coding.workspaces', 'create', 'post', `${codingAgent}/workspaces`, 'user', authSource],
  ['coding.workspaces', 'get', 'get', workspace, 'user', authSource],
  ['coding.workspaces', 'update', 'put', workspace, 'user', authSource],
  ['coding.workspaces', 'delete', 'delete', workspace, 'user', authSource],
  ['coding.repositories', 'list', 'get', `${workspace}/repos`, 'user', authSource],
  ['coding.repositories', 'create', 'post', `${workspace}/repos`, 'user', authSource],
  ['coding.repositories', 'get', 'get', repo, 'user', authSource],
  ['coding.repositories', 'update', 'put', repo, 'user', authSource],
  ['coding.repositories', 'delete', 'delete', repo, 'user', authSource],
  ['coding.repositories', 'listFiles', 'get', `${repo}/files`, 'user', authSource],
  ['coding.repositories', 'readFile', 'get', `${repo}/files/content`, 'user', authSource],
  ['sessions', 'list', 'get', '/sessions', 'user', authSource],
  ['sessions', 'listForAgent', 'get', `${agent}/sessions`, 'user', authSource],
  ['sessions', 'create', 'post', `${agent}/sessions`, 'user', authSource],
  ['sessions', 'get', 'get', session, 'user', authSource],
  ['sessions', 'update', 'put', session, 'user', authSource],
  ['sessions', 'delete', 'delete', session, 'user', authSource],
  ['sessions', 'resetContext', 'post', `${session}/context/reset`, 'user', authSource],
  ['sessions', 'generateTitle', 'post', `${session}/generate-title`, 'user', authSource],
  ['sessions', 'listFiles', 'get', `${session}/files`, 'user', authSource],
  ['sessions', 'readFile', 'get', `${session}/files/content`, 'user', authSource],
  ['sessions', 'downloadFile', 'get', `${session}/files/download`, 'user', authSource],
  ['sessions', 'uploadFile', 'post', `${session}/files/upload`, 'user', authSource],
  ['sessions', 'generateImages', 'post', `${session}/images/generations`, 'user', authSource],
  ['messages', 'send', 'post', `${session}/messages`, 'user', authSource, 'stream'],
  ['messages', 'list', 'get', `${session}/messages`, 'user', authSource],
  ['messages', 'get', 'get', '/messages/{message_id}', 'user', authSource],
  ['messages', 'delete', 'delete', '/messages/{message_id}', 'user', authSource],
  ['messages', 'deleteAll', 'delete', `${session}/messages`, 'user', authSource],
  ['agentSkills', 'list', 'get', `${agent}/skills`, 'user', authSource],
  ['agentSkills', 'mount', 'post', `${agent}/skills`, 'user', authSource],
  ['agentSkills', 'update', 'patch', `${agent}/skills/{skill_id}`, 'user', authSource],
  ['agentSkills', 'unmount', 'delete', `${agent}/skills/{skill_id}`, 'user', authSource],
  ['skills', 'list', 'get', '/skills', 'user', authSource],
  ['skills', 'create', 'post', '/skills', 'user', authSource],
  ['skills', 'get', 'get', skill, 'user', authSource],
  ['skills', 'update', 'patch', skill, 'user', authSource],
  ['skills', 'delete', 'delete', skill, 'user', authSource],
  ['skills', 'restore', 'post', `${skill}/undelete`, 'user', authSource],
  ['skills', 'validateBundle', 'post', '/skills/validate-bundle', 'user', authSource],
  ['skills', 'publishRevision', 'post', `${skill}/revisions`, 'user', authSource],
  ['skills', 'listRevisions', 'get', `${skill}/revisions`, 'user', authSource],
  ['skills', 'listRevisionContents', 'get', `${skill}/revisions/{version}/contents`, 'user', authSource],
  ['memories', 'list', 'get', '/memories', 'user', authSource],
  ['memories', 'create', 'post', '/memories', 'admin', specificationSource('post', '/memories')],
  ['memories', 'get', 'get', memory, 'user', authSource],
  ['memories', 'update', 'put', memory, 'admin', specificationSource('put', memory)],
  ['memories', 'delete', 'delete', memory, 'admin', specificationSource('delete', memory)],
  ['memories', 'listContents', 'get', `${memory}/contents`, 'user', authSource],
  ['memories', 'upsertContent', 'post', `${memory}/contents`, 'admin', specificationSource('post', `${memory}/contents`)],
  ['memories', 'createContentsBatch', 'post', `${memory}/contents/batch`, 'admin', specificationSource('post', `${memory}/contents/batch`)],
  ['memories', 'getContent', 'get', content, 'user', authSource],
  ['memories', 'updateContent', 'put', content, 'admin', specificationSource('put', content)],
  ['memories', 'deleteContent', 'delete', content, 'admin', specificationSource('delete', content)],
  ['memories', 'listContentChunks', 'get', `${content}/chunks`, 'admin', specificationSource('get', `${content}/chunks`)],
  ['memories', 'searchChunksByEmbedding', 'post', `${memory}/embeddings-search-chunks`, 'user', authSource],
  ['memories', 'searchContentsByEmbedding', 'post', `${memory}/embeddings-search-contents`, 'user', authSource],
  ['memories', 'getEmbeddingQueueStats', 'get', '/memories/queue/stats', 'admin', specificationSource('get', '/memories/queue/stats')],
  ['memories', 'listContentEmbeddingJobs', 'get', `${content}/jobs`, 'admin', specificationSource('get', `${content}/jobs`)],
  ['memories', 'rebuild', 'post', `${memory}/rebuild`, 'admin', specificationSource('post', `${memory}/rebuild`)],
  ['memories', 'listFailures', 'get', `${memory}/failures`, 'user', specificationSource('get', `${memory}/failures`)],
  ['coding.runners', 'list', 'get', '/coding/runners', 'admin', specificationSource('get', '/coding/runners')],
  ['coding.runners', 'create', 'post', '/coding/runners', 'admin', specificationSource('post', '/coding/runners')],
  ['coding.runners', 'get', 'get', runner, 'admin', specificationSource('get', runner)],
  ['coding.runners', 'update', 'patch', runner, 'admin', specificationSource('patch', runner)],
  ['coding.runners', 'delete', 'delete', runner, 'admin', specificationSource('delete', runner)],
  ['coding.runners', 'listImagePolicies', 'get', '/coding/runner-image-policies', 'admin', specificationSource('get', '/coding/runner-image-policies')],
  ['coding.runners.instances', 'list', 'get', `${runner}/instances`, 'admin', specificationSource('get', `${runner}/instances`)],
  ['coding.runners.instances', 'create', 'post', `${runner}/instances`, 'admin', specificationSource('post', `${runner}/instances`)],
  ['coding.runners.instances', 'get', 'get', instance, 'admin', specificationSource('get', instance)],
  ['coding.runners.instances', 'update', 'patch', instance, 'admin', specificationSource('patch', instance)],
  ['coding.runners.instances', 'delete', 'delete', instance, 'admin', specificationSource('delete', instance)],
  ['coding.agents', 'list', 'get', '/coding/agents', 'admin', specificationSource('get', '/coding/agents')],
  ['coding.agents', 'create', 'post', '/coding/agents', 'admin', specificationSource('post', '/coding/agents')],
  ['coding.agents', 'get', 'get', codingAgent, 'admin', specificationSource('get', codingAgent)],
  ['coding.agents', 'update', 'patch', codingAgent, 'admin', specificationSource('patch', codingAgent)],
  ['coding.agents', 'delete', 'delete', codingAgent, 'admin', specificationSource('delete', codingAgent)],
  ['coding.agents', 'getStatus', 'get', `${codingAgent}/status`, 'user', codingAPISource],
  ['coding.agents', 'ensureRunnerInstance', 'post', `${codingAgent}/runner-instance`, 'user-only', codingAPISource],
  ['coding.agents', 'streamStatus', 'get', `${codingAgent}/status/stream`, 'user', codingAPISource, undefined, 'status'],
  ['coding.sessions', 'create', 'post', `${codingAgent}/sessions`, 'user', authSource],
  ['coding.sessions', 'list', 'get', '/coding/sessions', 'user', authSource],
  ['coding.sessions', 'get', 'get', codingSession, 'user', authSource],
  ['coding.sessions', 'update', 'put', codingSession, 'user', authSource],
  ['coding.sessions', 'archive', 'delete', codingSession, 'user', authSource],
  ['coding.sessions', 'getTools', 'get', `${codingSession}/tools`, 'user', authSource],
  ['coding.sessions', 'generateTitle', 'post', `${codingSession}/generate-title`, 'user', codingAPISource],
  ['coding.sessions', 'listFiles', 'get', `${codingSession}/files`, 'user', codingAPISource],
  ['coding.sessions', 'uploadFile', 'post', `${codingSession}/files`, 'user', codingAPISource],
  ['coding.sessions', 'readFile', 'get', `${codingSession}/files/content`, 'user', codingAPISource],
  ['coding.sessions', 'downloadFile', 'get', `${codingSession}/files/download`, 'user-only', codingAPISource],
  ['coding.sessions', 'createDownloadLink', 'post', `${codingSession}/files/download-link`, 'user', codingAPISource],
  ['coding.toolCalls', 'resolve', 'post', `${codingSession}/tool-calls/{tool_call_id}/result`, 'user-only', codingAPISource],
  ['coding.turns', 'start', 'post', `${codingSession}/turns`, 'user', authSource],
  ['coding.turns', 'get', 'get', turn, 'user', authSource],
  ['coding.turns', 'cancel', 'post', `${turn}/cancel`, 'user', authSource],
  ['coding.turns', 'steer', 'post', `${turn}/steer`, 'user', authSource],
  ['coding.events', 'list', 'get', `${codingSession}/events`, 'user', authSource],
  ['coding.events', 'stream', 'get', `${codingSession}/stream`, 'user', codingEventsSource, undefined, 'coding'],
  ['coding.interactions', 'list', 'get', `${codingSession}/interactions`, 'user', authSource],
  ['coding.interactions', 'resolve', 'post', `${codingSession}/interactions/{interaction_id}/resolve`, 'user', authSource],
  ['coding.git', 'diff', 'get', `${codingSession}/diff`, 'user', authSource],
  ['coding.git', 'commit', 'post', `${codingSession}/commit`, 'user', authSource],
  ['coding.git', 'push', 'post', `${codingSession}/push`, 'user', authSource],
  ['coding.git', 'createPullRequest', 'post', `${codingSession}/pull-request`, 'user', authSource],
  ['coding.git', 'getIdentity', 'get', `${codingAgent}/git/identity`, 'user-only', codingAPISource],
  ['coding.git', 'updateIdentity', 'put', `${codingAgent}/git/identity`, 'user-only', codingAPISource],
  ['coding.models', 'list', 'get', '/coding/models', 'user', authSource],
  ['coding.modes', 'list', 'get', '/coding/modes', 'user', codingAPISource],
  ['chat.conversations', 'list', 'get', '/chat/conversations', 'user', authSource],
  ['chat.conversations', 'create', 'post', '/chat/conversations', 'user', authSource],
  ['chat.conversations', 'get', 'get', conversation, 'user', authSource],
  ['chat.conversations', 'update', 'put', conversation, 'user', authSource],
  ['chat.conversations', 'delete', 'delete', conversation, 'user', authSource],
  ['chat.conversations', 'generateTitle', 'post', `${conversation}/generate-title`, 'user', authSource],
  ['chat.messages', 'send', 'post', `${conversation}/messages`, 'user', authSource, 'stream'],
  ['chat.messages', 'list', 'get', `${conversation}/messages`, 'user', authSource],
  ['chat.messages', 'get', 'get', `${conversation}/messages/{message_id}`, 'user', authSource],
  ['chat.messages', 'delete', 'delete', `${conversation}/messages/{message_id}`, 'user', authSource],
  ['chat.messages', 'deleteAll', 'delete', `${conversation}/messages`, 'user', authSource],
  ['chat', 'send', 'post', '/chat/conversation', 'user', authSource, 'stream'],
  ['qa', 'list', 'get', '/qa/pairs', 'user', authSource],
  ['qa', 'create', 'post', '/qa/pairs', 'user', authSource],
  ['qa', 'get', 'get', '/qa/pairs/{id}', 'user', authSource],
  ['qa', 'update', 'put', '/qa/pairs/{id}', 'user', authSource],
  ['qa', 'delete', 'delete', '/qa/pairs/{id}', 'user', authSource],
  ['qa', 'batchDelete', 'post', '/qa/batch/delete', 'user', authSource],
  ['qa', 'search', 'post', '/qa/search', 'user', authSource],
  ['qa', 'match', 'get', '/qa/match', 'user', authSource],
  ['files', 'extract', 'post', '/files/extract', 'user', authSource],
  ['memories', 'filterContents', 'post', `${memory}/contents-filter`, 'user', authSource],
  ['settings.models', 'list', 'get', '/models', 'user', specificationSource('get', '/models')],
  ['settings.models', 'test', 'post', '/models/test', 'admin', specificationSource('post', '/models/test')],
  ['settings.models', 'create', 'post', '/models', 'admin', specificationSource('post', '/models')],
  ['settings.models', 'get', 'get', '/models/{id}', 'admin', specificationSource('get', '/models/{id}')],
  ['settings.models', 'update', 'patch', '/models/{id}', 'admin', specificationSource('patch', '/models/{id}')],
  ['settings.models', 'delete', 'delete', '/models/{id}', 'admin', specificationSource('delete', '/models/{id}')],
  ['settings.channels', 'list', 'get', '/channels', 'admin', specificationSource('get', '/channels')],
  ['settings.channels', 'update', 'put', '/channels/{id}', 'admin', specificationSource('put', '/channels/{id}')],
  ['settings.signingSecret', 'get', 'get', '/signing_secret', 'admin', specificationSource('get', '/signing_secret')],
  ['settings.signingSecret', 'regenerate', 'post', '/signing_secret/generate', 'admin', specificationSource('post', '/signing_secret/generate')],
] as const satisfies readonly OperationMapping[];

/** Validate HTTP coverage, explicit authorization and the public nested namespace before code generation. */
export function validateOperationMappings(spec: {paths: Record<string, Record<string, unknown>>}, mappings: readonly OperationMapping[] = operations): void {
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
  const expected = Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item).filter(method => methods.has(method)).map(method => `${method} ${path}`)).sort();
  const actual = mappings.map(([, , method, path]) => `${method} ${path}`).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Operation mapping mismatch. Missing: ${expected.filter(key => !actual.includes(key)).join(', ')}; extra/duplicate: ${actual.filter((key, i) => !expected.includes(key) || actual.indexOf(key) !== i).join(', ')}`);
  }
  const names = mappings.flatMap(([group, name, , , , , streamName]) => [`${group}.${name}`, ...(streamName ? [`${group}.${streamName}`] : [])]);
  const types = names.map(name => name.split('.').map(part => part[0]!.toUpperCase() + part.slice(1)).join(''));
  if (new Set(names).size !== names.length || new Set(types).size !== types.length) throw new Error('Duplicate public method or generated type name.');
  for (const [group, name, , , auth, source, streamName] of mappings) {
    if (![...group.split('.'), name, ...(streamName ? [streamName] : [])].every(part => /^[a-zA-Z_$][\w$]*$/.test(part))) throw new Error('Invalid public method name.');
    if (!['admin', 'user', 'user-only'].includes(auth) || !(source?.startsWith('https://') || source?.startsWith('../zai-openapi.json#/paths/'))) throw new Error(`Missing authorization or source: ${group}.${name}`);
  }
  if (names.some(name => names.some(other => other.startsWith(`${name}.`)))) throw new Error('Public method conflicts with a resource namespace.');
}
