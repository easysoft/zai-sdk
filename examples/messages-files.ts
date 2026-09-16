// 安装到其他项目后，将导入路径改为 'zai-sdk'。
import type {ZAIClient} from '../src/index.js';

/** 显式调用才创建临时会话；示例结束后删除本次会话。 */
export async function runConversationExample(client: ZAIClient, agentID: string): Promise<void> {
  const {session} = await client.sessions.create(agentID, {
    title: 'SDK example', skills: [], reference_settings: {memories: {collections: []}},
  });
  try {
    const response = await client.messages.send(session.id, {content: [{type: 'input_text', text: 'Reply briefly with OK.'}]});
    console.log(response.content);
    const stream = await client.messages.stream(session.id, {content: [{type: 'input_text', text: 'Say hello in one sentence.'}]}, {
      signal: AbortSignal.timeout(60_000),
    });
    for await (const event of stream) {
      if (event.type === 'data') console.log(event.event, event.data);
    }
    await client.sessions.uploadFile(session.id, {
      path: 'example/hello.txt', file: {blob: new Blob(['你好 ZAI'], {type: 'text/plain'}), filename: 'hello.txt'},
    });
    const file = await client.sessions.downloadFile(session.id, {path: 'example/hello.txt'});
    console.log(await file.text());
  } finally {
    await client.sessions.delete(session.id);
  }
}

export async function validateSkillExamples(client: ZAIClient, zip: Blob): Promise<void> {
  await client.skills.validateBundle({files: [{path: 'SKILL.md', media_type: 'text/markdown', content: '# Example\n\nA sample skill.'}]});
  await client.skills.validateBundle({bundle: {blob: zip, filename: 'skill.zip'}});
}
