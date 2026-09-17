/** User-facing guide content. API tables and signatures are generated separately. */
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';

// Highlight during generation so the standalone page needs no browser library.
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
const codeLanguages = {typescript: 'typescript', Shell: 'bash', 'JSON / OpenAPI': 'json'} as const;

export const groups: Record<string, {title: string; description: string}> = {
  agents: {title: 'Agent', description: '创建和管理 AI 助手，配置提示词、默认 Agent 与运行类型。'},
  executor: {title: '执行器', description: '读取或轮换当前用户的执行器公钥，管理工作区中的 AGENTS.md。'},
  workspaces: {title: '工作区', description: '管理 executor Agent 的开发工作区。工作区 ID 与 Agent ID 按路径顺序传入。'},
  repositories: {title: '代码仓库', description: '管理工作区中的仓库，浏览文件、读取文本或下载原始内容。'},
  sessions: {title: '会话', description: '管理对话上下文、模型、文件与图片生成。会话是发送消息的入口。'},
  messages: {title: '消息', description: '发送消息、接收完整 SSE 事件，以及读取和删除消息历史。'},
  agentSkills: {title: 'Agent 技能挂载', description: '将已有技能挂载到 Agent，配置版本和启用状态。'},
  skills: {title: '技能', description: '管理技能及其版本，校验 JSON 文件列表或 ZIP 技能包。'},
  models: {title: '模型', description: '查询可用模型，或将当前用户历史使用过的模型一并返回。'},
  memories: {title: '记忆', description: '管理记忆集合与内容，执行向量检索并查看分块、队列和任务状态。'},
};

export const operationTitles: Record<string, string> = {
  'agents.list': '列出 Agent', 'agents.create': '创建 Agent', 'agents.get': '获取 Agent',
  'agents.update': '更新 Agent', 'agents.delete': '删除 Agent',
  'executor.getPublicKey': '获取当前用户的公钥', 'executor.rotatePublicKey': '轮换当前用户的公钥',
  'executor.getAgentsMarkdown': '读取工作区 AGENTS.md', 'executor.updateAgentsMarkdown': '更新工作区 AGENTS.md',
  'workspaces.list': '列出工作区', 'workspaces.create': '创建工作区', 'workspaces.get': '获取工作区',
  'workspaces.update': '更新工作区', 'workspaces.delete': '删除工作区',
  'repositories.list': '列出仓库', 'repositories.create': '创建仓库', 'repositories.get': '获取仓库',
  'repositories.update': '更新仓库', 'repositories.delete': '删除仓库',
  'repositories.listFiles': '列出仓库文件', 'repositories.readFile': '读取仓库文件', 'repositories.downloadFile': '下载仓库文件',
  'sessions.list': '列出会话', 'sessions.listForAgent': '列出 Agent 的会话', 'sessions.create': '创建会话',
  'sessions.get': '获取会话', 'sessions.update': '更新会话', 'sessions.delete': '删除会话',
  'sessions.resetContext': '重置会话上下文', 'sessions.generateTitle': '生成会话标题',
  'sessions.listFiles': '列出会话文件', 'sessions.readFile': '读取会话文件', 'sessions.downloadFile': '下载会话文件',
  'sessions.uploadFile': '上传会话文件', 'sessions.generateImages': '生成图片',
  'messages.send': '发送消息并返回 JSON', 'messages.stream': '流式发送消息',
  'messages.list': '列出会话消息', 'messages.get': '获取消息', 'messages.delete': '删除消息', 'messages.deleteAll': '删除会话全部消息',
  'agentSkills.list': '列出已挂载技能', 'agentSkills.mount': '挂载技能', 'agentSkills.update': '更新技能挂载', 'agentSkills.unmount': '卸载技能',
  'skills.list': '列出技能', 'skills.create': '创建技能', 'skills.get': '获取技能', 'skills.update': '更新技能',
  'skills.delete': '删除技能', 'skills.restore': '恢复技能', 'skills.validateBundle': '校验技能包',
  'skills.publishRevision': '发布技能版本', 'skills.listRevisions': '列出技能版本', 'skills.listRevisionContents': '列出版本文件内容',
  'models.list': '列出模型',
  'memories.list': '列出记忆集合', 'memories.create': '创建记忆集合', 'memories.get': '获取记忆集合',
  'memories.update': '更新记忆集合', 'memories.delete': '删除记忆集合', 'memories.listContents': '列出记忆内容',
  'memories.upsertContent': '创建或更新记忆内容', 'memories.createContentsBatch': '批量创建记忆内容',
  'memories.getContent': '获取记忆内容', 'memories.updateContent': '更新记忆内容', 'memories.deleteContent': '删除记忆内容',
  'memories.listContentChunks': '列出内容分块', 'memories.searchChunksByEmbedding': '检索记忆分块',
  'memories.searchContentsByEmbedding': '检索记忆内容', 'memories.getEmbeddingQueueStats': '获取向量队列状态',
  'memories.listContentEmbeddingJobs': '列出内容的向量任务',
};

export const operationNotes: Record<string, string> = {
  'agents.create': 'system 类型由平台预置；创建自有 Agent 时使用 custom 或 executor。',
  'agents.delete': '删除默认 Agent 时，可通过 new_default_id 指定新的默认 Agent。请在调用前确认目标。',
  'executor.rotatePublicKey': '此调用会轮换密钥，请在确实需要轮换时执行。',
  'sessions.create': 'skills 省略或为 null 时继承 Agent 技能；[] 禁用本会话技能。workspace_id 与 executor_provider 用于 executor Agent。',
  'sessions.update': 'custom_data 等对象的合并、替换和清空语义以字段说明为准，SDK 直接传递输入。',
  'sessions.uploadFile': 'file 接受 File、Blob 或 {blob, filename}。SDK 自动生成 multipart boundary，无需设置 Content-Type。',
  'messages.send': '使用 MessagesSendInput。SDK 固定发送 stream: false；输入中不包含 stream 字段。',
  'messages.stream': '与 messages.send 使用同一个 HTTP 操作和 MessagesSendInput；SDK 固定发送 stream: true。返回异步迭代器，须先 await，再 for await。',
  'messages.deleteAll': '此调用删除指定会话的全部消息，请确认 sessionId。',
  'skills.validateBundle': '支持 JSON 文本文件列表或 ZIP 包。包内必须恰好有一个 SKILL.md；二进制文件使用 ZIP。ok: false 属于业务结果，不会自动抛出异常。',
  'skills.publishRevision': '支持 JSON 文件列表或 ZIP 包；版本号由服务端返回。二进制文件使用 ZIP。',
  'models.list': 'all 为字符串 "true" 或 "1"，不是布尔值。SDK 将数组和 {models} 两种服务端响应统一为 {models}。',
  'memories.getEmbeddingQueueStats': '规范将结果定义为开放对象，未约定固定字段；使用前检查服务端实际返回。',
  'memories.listContentEmbeddingJobs': '规范将任务定义为开放对象，未约定固定字段；使用前缩小类型。',
};

export interface Guide {
  id: string;
  title: string;
  description: string;
  body: string;
}

/** Escape all text before interpolation into the standalone HTML. */
export function escape(value: unknown): string {
  return String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]!));
}

// Used by the generator to typecheck the exact displayed TypeScript examples.
export const guideExamples: string[] = [];
export function code(source: string, language: keyof typeof codeLanguages = 'typescript', check = false): string {
  const value = source.trim();
  if (check) guideExamples.push(value);
  const grammar = codeLanguages[language];
  // JSON punctuation uses the base text color. Skip its many leaf wrappers in
  // large OpenAPI schemas while preserving escaped text and meaningful tokens.
  const highlighted = hljs.highlight(value, {language: grammar}).value
    .replace(/<span class="hljs-punctuation">([^<]*)<\/span>/g, '$1');
  return `<div class="code-block"><div class="code-bar"><span>${escape(language === 'typescript' ? 'TypeScript' : language)}</span><button class="copy-button" type="button" data-copy aria-label="复制代码">复制</button></div><pre tabindex="0"><code class="hljs language-${grammar}">${highlighted}</code></pre></div>`;
}

const note = (text: string) => `<aside class="note"><span class="note-label">使用提示</span><p>${text}</p></aside>`;

export function makeGuides(version: string): Guide[] {
  return [
    {
      id: 'quickstart', title: '安装与快速开始', description: '安装 ESM 包，创建客户端，完成第一次调用。',
      body: `<p>运行环境为 <strong>Node.js 22+</strong> 或支持原生 Fetch 的现代浏览器。SDK 使用 ESM，并自带 TypeScript 类型。当前仓库提供本地打包方式：</p>
${code(`pnpm install\npnpm build\npnpm pack --pack-destination /tmp/zai-sdk-pack\n\n# 在你的应用项目中安装\npnpm add /tmp/zai-sdk-pack/zai-sdk-${version}.tgz`, 'Shell')}
<h3>在 Node.js 中接入</h3><p>由 ZAI 服务管理员提供 API 地址、appID、appKey 和 userID。将它们放在服务端环境变量中，替换示例中的业务配置。</p>
${code(`import {createZAIClient, createZAITokenProvider} from 'zai-sdk';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('缺少环境变量：' + name);
  return value;
}

const client = createZAIClient({
  baseUrl: required('ZAI_BASE_URL'), // 例如 https://zai.example.com/v8
  getToken: createZAITokenProvider({
    credentials: {
      appID: required('ZAI_APP_ID'),
      appKey: required('ZAI_APP_KEY'),
      userID: required('ZAI_USER_ID'),
    },
  }),
});

const {agents} = await client.agents.list();
const agent = agents.find(item => item.status === 'active' && item.type === 'custom');
if (!agent) throw new Error('请先准备一个可用的 custom Agent');

const {session} = await client.sessions.create(agent.id, {title: '我的第一次对话'});
const reply = await client.messages.send(session.id, {
  content: [{type: 'input_text', text: '用一句话介绍自己'}],
});
console.log(reply.content);`, 'typescript', true)}
${note('这段示例会创建会话并调用模型。会话保留供后续对话使用；不再需要时可调用 <a href="#api-sessions-delete">sessions.delete()</a>。')}`,
    },
    {
      id: 'browser', title: '在浏览器中使用', description: '通过业务后端获取 Token，在前端创建客户端。',
      body: `<p>在 Vite 等 ESM 应用中导入 SDK。业务后端保存 <code>appKey</code>，根据当前登录用户签发 Token；前端只获取 <code>{token, expiresAt}</code>。</p>
${code(`import {createZAIClient, createZAITokenProvider} from 'zai-sdk';

const client = createZAIClient({
  baseUrl: '/v8', // 同源代理；跨域时填写完整 API 根地址
  getToken: createZAITokenProvider({
    fetchToken: async () => {
      const response = await fetch('/api/zai/token', {
        credentials: 'same-origin',
        headers: {accept: 'application/json'},
      });
      if (!response.ok) throw new Error('获取 ZAI Token 失败');
      return response.json();
    },
    refreshBeforeSeconds: 60,
  }),
});

const {models} = await client.models.list();
console.log(models);`, 'typescript', true)}
<p><code>/api/zai/token</code> 是需要由你的应用实现的业务接口，并非 SDK 内置接口。跨域部署时，服务端需允许应用来源、相应 HTTP 方法和 <code>Authorization</code> 等请求头；也可通过业务后端同源代理访问。</p>`,
    },
    {
      id: 'authentication', title: 'Token 与自动续期', description: '选择 Token 来源，理解有效期和并发刷新。',
      body: `<p><code>createZAITokenProvider()</code> 支持两种互斥来源：服务端使用 <code>credentials</code> 本地签发；浏览器使用 <code>fetchToken</code> 从业务后端取得 Token。</p>
<div class="table-wrap"><table><thead><tr><th>选项</th><th>类型 / 默认值</th><th>说明</th></tr></thead><tbody>
<tr><td><code>credentials</code></td><td>ZAICredentials</td><td>appID、appKey、userID 均为非空字符串；与 fetchToken 二选一。</td></tr>
<tr><td><code>fetchToken</code></td><td>() =&gt; ZAIToken | Promise&lt;ZAIToken&gt;</td><td>返回非空 token 和未来的整数 expiresAt。</td></tr>
<tr><td><code>expiresInSeconds</code></td><td>number / 1000</td><td>仅适用于 credentials，必须为正整数。</td></tr>
<tr><td><code>refreshBeforeSeconds</code></td><td>number / 60</td><td>提前续期窗口，必须为非负整数。</td></tr>
</tbody></table></div>
<p>首次请求获取 Token；剩余有效期小于等于续期窗口时，在下一次请求前刷新。并发请求共享一次刷新，提供器独立缓存，没有后台定时器。刷新失败后，下次调用可再次尝试；新 Token 仍有效但已进入窗口时，本次调用直接使用，不会循环刷新。</p>
${note('<code>expiresAt</code> 和 <code>expiredTime</code> 都是 Unix <strong>秒</strong>，不是毫秒。切换登录用户时创建新的提供器和客户端。取消一个请求不会取消其他请求共享的 Token 获取。')}
<h3>手动签发 Token</h3>
${code(`import {createZAIToken} from 'zai-sdk';

const token = createZAIToken(
  'your-app-id',
  'your-server-side-app-key',
  'your-user-id',
  Math.floor(Date.now() / 1000) + 1000,
);`, 'typescript', true)}
<p>签发遵循 ZAI 的 MD5 + Base64 协议。<code>appID</code>、<code>userID</code> 必须可用 Latin-1 编码；<code>appKey</code> 以 UTF-8 参与 MD5。自定义同步或异步 <code>getToken</code> 也可使用，但缓存与续期由调用方负责。SDK 不会在 401 后自动重放请求，也不会因为 Token 更新而重连已有 SSE。</p>`,
    },
    {
      id: 'requests', title: '客户端与请求配置', description: 'API 地址、请求头、取消、超时和分页约定。',
      body: `<p><code>createZAIClient(options)</code> 返回 <code>ZAIClient</code>。<code>baseUrl</code> 必须包含 <code>/v8</code>，Node.js 使用完整 HTTP(S) 地址；浏览器也支持相对地址。地址不能包含用户名、密码、查询参数或 fragment。</p>
<div class="table-wrap"><table><thead><tr><th>CreateZAIClientOptions</th><th>类型</th><th>说明</th></tr></thead><tbody>
<tr><td><code>baseUrl</code> <b class="required">必填</b></td><td>string</td><td>API 根地址，例如 https://zai.example.com/v8。</td></tr>
<tr><td><code>getToken</code> <b class="required">必填</b></td><td>() =&gt; string | Promise&lt;string&gt;</td><td>每次请求调用；推荐传入 createZAITokenProvider 的结果。</td></tr>
<tr><td><code>fetch</code></td><td>typeof globalThis.fetch</td><td>可选，自定义 Fetch；默认使用原生 Fetch。</td></tr>
<tr><td><code>headers</code></td><td>HeadersInit</td><td>可选，所有请求的默认请求头。</td></tr>
</tbody></table></div>
<p>资源方法按路径顺序接收 ID，再接收查询参数或请求体，最后是可选的 <code>ZAIRequestOptions</code>（<code>signal?: AbortSignal</code>、<code>headers?: HeadersInit</code>）。接口字段保留 snake_case；ID 使用字符串，不要预先 URL 编码。</p>
${code(`// client 已按快速开始创建。
const page = await client.sessions.list({page: 1, page_size: 20});
console.log(page);

// 跳过可选查询参数，但传入请求选项。
await client.models.list(undefined, {
  signal: AbortSignal.timeout(10_000),
  headers: {'X-Request-ID': 'request-123'},
});

const controller = new AbortController();
const request = client.agents.list({signal: controller.signal});
controller.abort();
try {
  await request;
} catch (error) {
  // 在错误处理章节中按 error.code 处理取消。
}`, 'typescript', true)}
<p>请求级 headers 覆盖同名默认 headers。SDK 根据返回模式和请求体设置 <code>Accept</code>、<code>Content-Type</code>，并用 <code>getToken</code> 的结果设置 <code>Authorization: Bearer …</code>。无需手动设置这些协议头。</p>
<p>列表每次只读取一页，保留服务端分页结构。会话列表的 <code>page</code> 从 1 开始，<code>page_size</code> 默认为 20、最大 100。分页循环、缓存和重试由应用决定。</p>`,
    },
    {
      id: 'doctor', title: '连接与功能检查', description: '逐项诊断配置、协议、鉴权、模型与 Agent，可选验证真实对话。',
      body: `<p><code>client.doctor(options?)</code> 返回 <code>Promise&lt;ZAIDoctorResult&gt;</code>。默认只读取 Agent 和模型列表，不创建会话。<code>onChange</code> 在每项检查完成后接收 <code>ZAIDoctorDetail</code>，可用于展示诊断进度。</p>
${code(`const result = await client.doctor({
  onChange: detail => console.log(detail.type, detail.pass, detail.message),
});
console.log(result.pass, result.summary);

const controller = new AbortController();
const full = await client.doctor({
  chat: true,
  // agentId: 'your-agent-id',
  // model: 'your-model-id',
  timeoutMs: 30_000,
  signal: controller.signal,
});
if (!full.pass) {
  console.log(full.details.filter(detail => !detail.pass));
}`, 'typescript', true)}
<p>默认检查顺序为 <code>config</code>、<code>httpProtocol</code>、<code>server</code>、<code>chatModels</code>、<code>agents</code>。连接检查读取 Agent 列表，验证当前 Token 可用；功能检查要求至少一个可用模型和一个活跃的 custom Agent。优先选择默认的活跃 custom Agent，再选择首个符合条件的 Agent；指定 <code>agentId</code> 或 <code>model</code> 时必须能找到对应的可用对象。未指定模型时，真实对话使用服务端默认模型。</p>
<p>配置、协议或连接失败时提前结束；模型或 Agent 不可用时不发送消息。<code>details</code> 仅包含已执行的检查，<code>pass</code> 表示这些检查全部通过。客户端构造配置错误仍由 <code>createZAIClient()</code> 抛出；检查过程中的请求错误保留为 <code>detail.error</code>，不会因普通检查失败拒绝 Promise。<code>onChange</code> 回调异常会在尝试必要清理后继续抛出。</p>
${note('<code>chat: true</code> 会创建临时会话并消耗少量模型用量，增加 <code>chat</code> 和 <code>cleanup</code> 检查。会话禁用技能和记忆检索，消息使用空工具列表及 schema-only 模式；只发送一条短消息。')}
<p><code>timeoutMs</code> 默认 30,000，必须为 1 至 2,147,483,647 的整数，作用于每个请求及其 Token 获取，不是整个诊断的总时长。支持 <code>headers</code> 和 <code>signal</code>。即使对话失败或取消，也会用独立的超时请求尝试删除本次创建的会话。清理失败使整体检查失败，返回的 <code>sessionId</code> 可用于后续处理；会话创建响应丢失时无法确定 ID，也无法自动清理。</p>
<p>浏览器支持相对地址，检查 HTTPS 页面访问 HTTP API 的混合内容问题（回环地址除外）；CORS 等问题通过实际请求报告。v8 规范没有服务版本或 embedding 模型能力字段，因此不推断这些能力。诊断也不验证 SSE、文件、技能和执行器运行状态。</p>`,
    },
    {
      id: 'conversation', title: '会话与消息', description: '创建会话，选择模型与技能，发送文本和文件引用。',
      body: `<p>先选择一个可用 Agent，再创建会话。在同一个 <code>session.id</code> 下发送多条消息以延续对话。需要指定模型时，先通过 <a href="#api-models-list">models.list()</a> 获取模型 ID。</p>
${code(`const {session} = await client.sessions.create('your-agent-id', {
  title: '文档助手',
  skills: [],
  reference_settings: {memories: {collections: []}},
});

const reply = await client.messages.send(session.id, {
  content: [{type: 'input_text', text: '请概括这份文档'}],
});
console.log(reply.content);

const history = await client.messages.list(session.id);
console.log(history);`, 'typescript', true)}
<p><code>skills</code> 省略或为 null 时继承 Agent 技能，空数组禁用技能，指定 ID 数组则使用这些技能。<code>reference_settings.memories.collections</code> 配置记忆检索范围，省略或空数组禁用检索。</p>
<p>消息内容支持 <code>input_text</code>、<code>input_image</code> 和 <code>input_file</code>。图片及文件通过 <code>path</code> 引用已上传的会话文件；可附带 <code>mime_type</code> 和 <code>name</code>。具体字段及工具配置见 <a href="#api-messages-send">messages.send()</a>。</p>
<p>executor Agent 可通过 <code>workspace_id</code> 绑定工作区，使用 <code>executor_provider</code> 选择 <code>claude</code>、<code>codex</code> 或 <code>opencode</code>。<code>custom_data</code> 原样传给服务端，SDK 不额外合并对象。</p>`,
    },
    {
      id: 'streaming', title: '流式响应 SSE', description: '消费异步事件、识别完成状态，并正确释放流。',
      body: `${code(`const controller = new AbortController();
const stream = await client.messages.stream('your-session-id', {
  content: [{type: 'input_text', text: '解释一下这段代码'}],
}, {signal: controller.signal});

try {
  for await (const event of stream) {
    if (event.type === 'done') break;
    // event.data 是 unknown，按你的应用协议缩小类型后再使用。
    console.log(event.event, event.data);
  }
} finally {
  await stream.return?.();
}
// 在停止按钮的处理函数中调用 controller.abort()。`, 'typescript', true)}
<div class="table-wrap"><table><thead><tr><th>事件</th><th>字段</th><th>处理方式</th></tr></thead><tbody>
<tr><td><code>type: 'data'</code></td><td>event、id?、rawData、data</td><td>event 默认为 message；rawData 是原始 JSON 文本，data 为解析后的 unknown。</td></tr>
<tr><td><code>type: 'done'</code></td><td>无其他字段</td><td>服务端 [DONE] 已到达，正常完成。</td></tr>
</tbody></table></div>
<p>SDK 保留完整 chunk，包括所有 choice、工具调用增量、usage 和新字段；不自动抽取文本，也不自动执行工具。<code>send()</code> 固定 JSON，<code>stream()</code> 固定 SSE，不需要传入 stream 开关。</p>
<p><code>break</code> 会释放已迭代的流。如果取得迭代器后尚未开始迭代就放弃，调用 <code>await stream.return?.()</code> 或取消关联的 signal。异常 JSON、错误事件、无效 UTF-8、超过 1 MiB 解析缓冲或未收到 [DONE] 就结束会抛错；网络读取失败和主动取消有独立错误码。流不会自动重试或重连。</p>`,
    },
    {
      id: 'files', title: '上传与下载文件', description: '使用 File 或 Blob 上传，按文本或二进制读取。',
      body: `${code(`await client.sessions.uploadFile('your-session-id', {
  path: 'input/report.txt',
  file: {
    blob: new Blob(['报告正文'], {type: 'text/plain'}),
    filename: 'report.txt',
  },
});

await client.messages.send('your-session-id', {
  content: [
    {type: 'input_text', text: '请总结这个文件'},
    {type: 'input_file', path: 'input/report.txt', name: 'report.txt'},
  ],
});

const blob = await client.sessions.downloadFile('your-session-id', {
  path: 'input/report.txt',
});
console.log(await blob.text());`, 'typescript', true)}
<p><code>ZAIUploadFile</code> 为 <code>Blob | {blob: Blob; filename: string}</code>。浏览器的 <code>File</code> 继承 Blob，可直接传入；裸 Blob 默认文件名为 <code>blob</code>。SDK 自动构造 FormData，上传时无需设置 Content-Type。</p>
<p><code>readFile()</code> 返回规范定义的 JSON，<code>downloadFile()</code> 返回 Blob。仓库文件提供同样的两种读取方式，但需额外传入 Agent、工作区和仓库 ID。</p>`,
    },
    {
      id: 'skills-guide', title: '技能包与版本', description: '校验技能包，创建技能，发布版本并挂载到 Agent。',
      body: `${code(`const files = [{
  path: 'SKILL.md',
  media_type: 'text/markdown',
  content: '---\\nname: report-helper\\ndescription: Summarize reports.\\n---\\n\\n# Report helper\\nSummarize the supplied report.',
}];
const validation = await client.skills.validateBundle({files});
if (!validation.ok) throw new Error('请根据校验结果修正技能包');

const {skill} = await client.skills.create({key: 'report-helper', name: '报告助手'});
await client.skills.publishRevision(skill.id, {files, changelog: '初始版本'});
await client.skills.update(skill.id, {status: 'active'});
await client.agentSkills.mount('your-agent-id', {skill_id: skill.id});`, 'typescript', true)}
<p>JSON 方式适用于文本文件；包含二进制文件时传入 <code>{bundle: {blob: zipBlob, filename: 'skill.zip'}}</code>。两种方式均要求恰好包含一个 SKILL.md。发布版本后，可通过 <code>listRevisions()</code> 和 <code>listRevisionContents()</code> 查看版本及文件。</p>`,
    },
    {
      id: 'memories-guide', title: '记忆与检索', description: '创建集合、写入知识，并在会话中启用检索。',
      body: `${code(`// collectionId 为已有记忆集合的 ID。
await client.memories.upsertContent('your-collection-id', {
  key: 'product-guide',
  content_type: 'markdown',
  content: '# 产品指南\\n这里是需要检索的产品知识。',
});

const matches = await client.memories.searchChunksByEmbedding('your-collection-id', {
  query: '如何开始使用？',
  limit: 5,
  min_similarity: 0.5,
});
console.log(matches);

const {session} = await client.sessions.create('your-agent-id', {
  reference_settings: {memories: {
    collections: ['your-collection-id'],
    limit: 5,
    min_similarity: 0.5,
  }},
});`, 'typescript', true)}
<p>通过 <a href="#api-memories-create">memories.create()</a> 创建集合，写入内容后可查看 <code>embedding_status</code> 和 <code>listContentEmbeddingJobs()</code>。不要将写入成功视为向量处理已完成；需按服务端状态决定何时检索。</p>`,
    },
    {
      id: 'errors', title: '错误处理与常见问题', description: '按稳定错误码分支，区分协议错误与业务结果。',
      body: `${code(`import {ZAIClientError} from 'zai-sdk';

try {
  await client.agents.list();
} catch (error) {
  if (!(error instanceof ZAIClientError)) throw error;
  if (error.code === 'aborted') {
    // 用户取消，通常不需要显示失败提示。
  } else if (error.code === 'authentication') {
    // 检查 Token 来源、凭据、登录状态和权限。
  } else {
    // 只记录业务需要的字段，避免在公开日志中输出整个错误对象。
    console.error(error.code, error.status, error.method, error.path);
  }
}`, 'typescript', true)}
<div class="table-wrap"><table><thead><tr><th>code</th><th>含义</th><th>建议</th></tr></thead><tbody>
<tr><td>authentication</td><td>Token 获取失败、无效 Token，或 HTTP 401 / 403。</td><td>检查凭据、有效期、用户身份和访问权限。</td></tr>
<tr><td>http</td><td>除 401 / 403 外的非成功 HTTP 响应。</td><td>检查 status、body 与接口参数。</td></tr>
<tr><td>network</td><td>连接或响应读取失败。</td><td>检查网络、代理和跨域配置；重试前确认操作是否可重复。</td></tr>
<tr><td>aborted</td><td>AbortSignal 主动取消或超时。</td><td>按应用的取消或超时流程处理。</td></tr>
<tr><td>invalid-input</td><td>无法构造请求、无效路径 ID、上传格式或配置错误。</td><td>修正调用参数。</td></tr>
<tr><td>invalid-response</td><td>意外成功状态、错误媒体类型、无效 JSON / SSE 等。</td><td>核对 API 版本及服务端响应。</td></tr>
</tbody></table></div>
<p><code>ZAIClientError</code> 继承 Error，包含 <code>code</code>；还可包含 <code>status</code>、<code>body</code>、<code>method</code>、<code>path</code>、<code>headers</code>、<code>cause</code>。这些可选字段只在信息可用时存在。根据 code 分支，避免依赖错误文案。</p>
<details class="faq"><summary>为什么返回了 ok: false，却没有抛出异常？</summary><p>正常 HTTP 响应内的业务结果原样返回。请检查 ok、success 等字段，按相应接口处理。</p></details>
<details class="faq"><summary>为什么设置 all: true 出现类型错误？</summary><p>models.list 的 all 参数为字符串，使用 <code>{all: 'true'}</code> 或 <code>{all: '1'}</code>。</p></details>
<details class="faq"><summary>SDK 会自动重试、重连或执行工具吗？</summary><p>不会。缓存、重试、工具执行和 UI 状态由应用负责；尤其是消息发送、创建或删除操作，重试前应确认上一次请求的结果。</p></details>
<details class="faq"><summary>TypeScript 类型是否等于完整运行时校验？</summary><p>不是。SDK 校验传输协议和必要边界，但不会对所有返回 JSON 做完整 schema 校验。开放对象和 unknown 数据需由应用缩小类型。</p></details>`,
    },
  ];
}
