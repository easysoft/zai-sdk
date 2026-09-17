import type {ZAIClient, AgentsListResponse} from './client.js';
import {ZAIClientError} from './errors.js';
import type {ZAIRequestOptions} from './types.js';

export interface ZAIDoctorOptions extends ZAIRequestOptions {
  /** Send a short message in a temporary session. Defaults to false. Consumes model usage. */
  chat?: boolean;
  /** An active custom Agent. Defaults to the default active custom Agent, then the first available one. */
  agentId?: string;
  /** Optional available model ID; otherwise the server selects its default. */
  model?: string;
  /** Timeout per request, including cleanup. Defaults to 30,000 milliseconds. */
  timeoutMs?: number;
  /** Called once per completed check. Callback exceptions propagate after any session cleanup. */
  onChange?: (detail: ZAIDoctorDetail) => void;
}

export interface ZAIDoctorDetail {
  type: 'config' | 'httpProtocol' | 'server' | 'chatModels' | 'agents' | 'chat' | 'cleanup';
  name: string;
  pass: boolean;
  message: string;
  error?: Error;
}

export interface ZAIDoctorResult {
  /** All requested checks, including temporary session cleanup, passed. */
  pass: boolean;
  summary: string;
  details: ZAIDoctorDetail[];
  /** The selected active custom Agent, if one was found. */
  agentId?: string;
  /** The temporary session ID, retained even after cleanup to help diagnose cleanup failures. */
  sessionId?: string;
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim() && value !== '.' && value !== '..';
}

function failure(type: ZAIDoctorDetail['type'], name: string, message: string, error: unknown): ZAIDoctorDetail {
  return {type, name, pass: false, message, error: error instanceof Error ? error : new Error(message, {cause: error})};
}

/** Internal implementation shared by client.doctor; uses the client's transport and token provider. */
export async function runZAIDoctor(
  client: Pick<ZAIClient, 'agents' | 'models' | 'sessions' | 'messages'>,
  baseUrl: string,
  options: ZAIDoctorOptions = {},
): Promise<ZAIDoctorResult> {
  const details: ZAIDoctorDetail[] = [];
  const result: ZAIDoctorResult = {pass: true, summary: '', details};
  const add = (detail: ZAIDoctorDetail) => {
    details.push(detail);
    options.onChange?.(detail);
  };
  const finish = () => {
    result.pass = details.every(detail => detail.pass);
    result.summary = result.pass ? 'All requested checks passed.' : 'Checks failed.';
    return result;
  };
  const timeoutMs = options.timeoutMs ?? 30_000;
  const configOK = Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 2_147_483_647
    && (options.chat === undefined || typeof options.chat === 'boolean')
    && (options.agentId === undefined || validId(options.agentId))
    && (options.model === undefined || validId(options.model));
  add({type: 'config', name: 'Config', pass: configOK, message: configOK
    ? 'Client and diagnostic options are valid.'
    : 'Use a positive integer timeoutMs (at most 2147483647), a boolean chat flag, and non-empty agentId/model values.'});
  if (!configOK) return finish();

  const url = new URL(baseUrl);
  const loopback = url.hostname === 'localhost' || url.hostname.endsWith('.localhost')
    || url.hostname === '[::1]' || /^127\./.test(url.hostname);
  const protocolOK = globalThis.location?.protocol !== 'https:' || url.protocol === 'https:' || loopback;
  add({type: 'httpProtocol', name: 'Protocol match', pass: protocolOK, message: protocolOK
    ? 'The API address is compatible with the current page protocol.'
    : 'An HTTPS page cannot connect to an HTTP API. Use HTTPS or a same-origin proxy.'});
  if (!protocolOK) return finish();

  const requestOptions = (cleanup = false): ZAIRequestOptions => {
    const timeout = AbortSignal.timeout(timeoutMs);
    return {headers: options.headers, signal: !cleanup && options.signal
      ? AbortSignal.any([options.signal, timeout]) : timeout};
  };

  let agents: AgentsListResponse['agents'];
  let serverDetail: ZAIDoctorDetail;
  try {
    const response = await client.agents.list(requestOptions());
    if (!response || !Array.isArray(response.agents) || response.agents.some(agent => !agent
      || !validId(agent.id) || !['system', 'custom', 'executor'].includes(agent.type)
      || !['active', 'disabled', 'deleted'].includes(agent.status))) {
      throw new ZAIClientError('invalid-response', 'Invalid agent list response.');
    }
    agents = response.agents;
    serverDetail = {type: 'server', name: 'Server', pass: true, message: 'Connected to the ZAI API with a valid authentication token.'};
  } catch (error) {
    add(failure('server', 'Server', 'Unable to read agents. Check the API address, credentials and network access.', error));
    return finish();
  }
  add(serverDetail);

  let modelsDetail: ZAIDoctorDetail;
  try {
    const {models} = await client.models.list(undefined, requestOptions());
    if (models.some(model => !validId(model.id))) throw new ZAIClientError('invalid-response', 'Invalid model ID in the model list.');
    const available = models.filter(model => model.status === undefined || model.status === 'active');
    const pass = options.model === undefined ? available.length > 0 : available.some(model => model.id === options.model);
    modelsDetail = {type: 'chatModels', name: 'Chat models', pass, message: pass
      ? `${available.length} model(s) available.`
      : options.model === undefined ? 'No available chat models found.' : 'The requested model is not available.'};
  } catch (error) {
    modelsDetail = failure('chatModels', 'Chat models', 'Unable to read available models.', error);
  }
  add(modelsDetail);

  const eligible = agents.filter(agent => agent.status === 'active' && agent.type === 'custom');
  const agent = options.agentId === undefined
    ? eligible.find(agent => agent.is_default) ?? eligible[0]
    : eligible.find(agent => agent.id === options.agentId);
  result.agentId = agent?.id;
  add({type: 'agents', name: 'Chat agents', pass: !!agent, message: agent
    ? 'An active custom Agent is available.'
    : options.agentId === undefined ? 'No active custom Agent found.' : 'The requested Agent is not an active custom Agent.'});
  if (!options.chat || !modelsDetail.pass || !agent) return finish();

  // Keep callback delivery inside the cleanup boundary, but outside request catches.
  try {
    let chatDetail: ZAIDoctorDetail;
    try {
      const created = await client.sessions.create(agent.id, {
        title: 'ZAI SDK connection check', category: 'zai-sdk-doctor', model: options.model,
        skills: [], reference_settings: {memories: {collections: []}},
        prompt: 'This is a connection check. Answer very briefly. Do not use tools, skills, or external resources.',
      }, requestOptions());
      if (!validId(created?.session?.id)) throw new ZAIClientError('invalid-response', 'Session creation did not return a valid session ID.');
      result.sessionId = created.session.id;
      const response = await client.messages.send(result.sessionId, {
        content: [{type: 'input_text', text: 'Reply with exactly OK. Do not call any tools.'}],
        tools: [], tool_execution_mode: 'schema-only',
      }, requestOptions());
      if (!response || typeof response.content !== 'string' || !response.content.trim()
        || (response.execution_summary?.status !== undefined && response.execution_summary.status !== 'completed')) {
        throw new ZAIClientError('invalid-response', 'The chat probe did not return a successful, non-empty reply.');
      }
      chatDetail = {type: 'chat', name: 'Chat', pass: true, message: 'The server returned a reply to the test message.'};
    } catch (error) {
      chatDetail = failure('chat', 'Chat', 'Unable to complete a conversation with the server.', error);
    }
    add(chatDetail);
  } finally {
    if (result.sessionId) {
      let cleanupDetail: ZAIDoctorDetail;
      const cleanupFailure = `Unable to delete temporary session ${result.sessionId}.`;
      try {
        // A cancelled or timed-out probe must still attempt cleanup with a fresh signal.
        const response = await client.sessions.delete(result.sessionId, requestOptions(true));
        const deleted = response && typeof response.message === 'string' && !('ok' in response && response.ok === false);
        cleanupDetail = deleted
          ? {type: 'cleanup', name: 'Cleanup', pass: true, message: 'The temporary session was deleted.'}
          : failure('cleanup', 'Cleanup', cleanupFailure, new ZAIClientError('invalid-response', 'Invalid session deletion response.'));
      } catch (error) {
        cleanupDetail = failure('cleanup', 'Cleanup', cleanupFailure, error);
      }
      add(cleanupDetail);
    }
  }
  return finish();
}
