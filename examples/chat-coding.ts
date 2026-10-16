import type {ZAIClient, ZAICodingEvent} from '../src/index.js';

/** Explicit creation retains the ID needed to read history and clean up. */
export async function chatExample(client: ZAIClient) {
  const conversation = await client.chat.conversations.create({title: 'SDK Chat 示例'});
  try {
    const reply = await client.chat.messages.send(conversation.id, {content: '你好', tools: [], tool_execution_mode: 'schema-only'});
    for await (const event of await client.chat.messages.stream(conversation.id, {
      content: '再用一句话回答', tools: [], tool_execution_mode: 'schema-only',
    })) {
      if (event.type === 'data') console.log(event.data);
    }
    return {reply, history: await client.chat.messages.list(conversation.id)};
  } finally {
    await client.chat.conversations.delete(conversation.id);
  }
}

/** Requires an existing test workspace and a ready user Runner configured by the application. */
export async function codingExample(client: ZAIClient, agentId: string, workspaceId: string, signal?: AbortSignal) {
  const status = await client.coding.agents.getStatus(agentId, undefined, {signal});
  if (status.status !== 'ready') throw new Error('Runner is not ready. Query its status before starting a turn.');
  const idempotencyKey = crypto.randomUUID(); // Persist and reuse this value if session creation is retried.
  const session = await client.coding.sessions.create(agentId, {workspace_id: workspaceId, title: 'SDK Coding 示例'}, {signal, idempotencyKey});
  let turn: Awaited<ReturnType<ZAIClient['coding']['turns']['start']>> | undefined;
  let terminal = false;
  try {
    turn = await client.coding.turns.start(session.id, {content: '简要描述项目结构，不修改任何文件。'}, {signal});
    let lastSeq = '0';
    const events: ZAICodingEvent[] = [];
    for await (const event of await client.coding.events.stream(session.id, {after_seq: lastSeq}, {signal})) {
      lastSeq = String(event.data.seq); // Advance for empty-text and nonterminal error events too.
      events.push(event.data);
      if (event.data.turn_id === turn.id && ['turn.completed', 'turn.failed', 'turn.canceled'].includes(event.data.type)) {
        terminal = true;
        break; // Ends this subscription; the session stream itself has no DONE.
      }
    }
    return {turn: await client.coding.turns.get(session.id, turn.id, {signal}), events, lastSeq};
  } finally {
    // Cleanup uses independent signals after cancellation of the caller.
    try {
      if (turn && !terminal) await client.coding.turns.cancel(session.id, turn.id, {signal: AbortSignal.timeout(30_000)});
    } finally {
      await client.coding.sessions.archive(session.id, {signal: AbortSignal.timeout(30_000)});
    }
  }
}
