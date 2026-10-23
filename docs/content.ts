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
  agents: {title: 'Agent', description: '管理 AI 助手，配置 custom、runner 或平台预置的 system 类型。'},
  sessions: {title: '普通会话', description: '管理 Agent 会话、上下文、文件与图片生成。'},
  messages: {title: '普通消息', description: '以 content 数组发送消息，返回 JSON 或 SSE。'},
  'chat.conversations': {title: 'Chat 会话', description: '管理面向聊天的独立会话、标题及设置。'},
  'chat.messages': {title: 'Chat 消息', description: '在已有 Chat 会话中发送文本及 attachments，读取或删除历史。'},
  chat: {title: 'Chat 便捷发送', description: '创建或续接 Chat 会话并发送 JSON/SSE 消息。'},
  'coding.workspaces': {title: 'Coding 工作区', description: '管理开发工作区和 AGENTS.md。'},
  'coding.repositories': {title: 'Coding 仓库', description: '管理仓库、列出文件树、读取内容及下载原始文件。响应中的 relative_path 相对工作区根目录，当前为 repo_key，在仓库物化前也可用。'},
  'coding.keys': {title: 'Coding 密钥', description: '使用 ek 确保、读取或轮换当前用户的 SSH 公钥。'},
  'coding.runners': {title: 'Runner 配置', description: '应用管理员查询 Runner Profile 与镜像策略；Profile 写接口用于旧客户端兼容。'},
  'coding.runners.instances': {title: 'Runner 实例', description: '应用管理员管理用户 Runner 实例；接受请求不等于实例已就绪。'},
  'coding.agents': {title: 'Coding Agent', description: '应用管理员管理 Coding Agent；用户查询状态、确保实例并订阅状态流。'},
  'coding.sessions': {title: 'Coding 会话', description: '创建绑定工作区和 Runner 实例的编码会话，管理附件、标题、工具并归档。'},
  'coding.toolCalls': {title: 'Coding 客户端工具', description: '由当前用户回填客户端工具的执行结果或错误。'},
  'coding.turns': {title: 'Coding Turn', description: '异步启动编码任务，查询、取消或插话。'},
  'coding.events': {title: 'Coding 事件', description: '读取历史事件，或通过持续 SSE 接收会话事件。'},
  'coding.interactions': {title: 'Coding 交互', description: '读取待处理交互，提交审批或输入。'},
  'coding.git': {title: 'Coding Git', description: '配置当前用户 Git 身份，查看 diff、提交、推送和创建 Pull Request。'},
  'coding.models': {title: 'Coding 模型', description: '通过 agent_id 查询 Coding provider 提供的模型。'},
  'coding.modes': {title: 'Coding 执行模式', description: '查询 Coding provider 支持的执行模式。'},
  agentSkills: {title: 'Agent 技能挂载', description: '挂载技能，配置版本和启用状态。'},
  skills: {title: '技能', description: '管理技能版本，校验 JSON 文件列表或 ZIP 技能包。'},
  memories: {title: '记忆', description: '管理记忆集合与内容，检索、过滤并查看处理状态；写入和运维接口需要 ak。'},
  qa: {title: '问答 QA', description: '维护问答对，批量删除、搜索和匹配。'},
  files: {title: '文件提取', description: '上传文件并提取文本，无需会话 ID 或 path。'},
  'settings.models': {title: '模型目录与管理', description: '默认以 ek 查询应用可用模型；以 ak 管理自有模型记录和显式测试模型。数字 id 与调用模型的 model_id 不同。'},
  'settings.channels': {title: '渠道管理', description: '应用管理员查询和配置上游渠道。'},
  'settings.signingSecret': {title: '签名密钥管理', description: '应用管理员读取或主动轮换 ek 签名密钥。'},
};

export const operationTitles: Record<string, string> = {
  'agents.list': '列出 Agent', 'agents.create': '创建 Agent', 'agents.get': '获取 Agent',
  'agents.update': '更新 Agent', 'agents.delete': '删除 Agent',
  'coding.keys.getPublic': '获取当前用户的公钥', 'coding.keys.rotate': '轮换当前用户的公钥',
  'coding.keys.ensure': '确保当前用户的 SSH 密钥',
  'coding.workspaces.getAgentsMarkdown': '读取工作区 AGENTS.md', 'coding.workspaces.updateAgentsMarkdown': '更新工作区 AGENTS.md',
  'coding.workspaces.list': '列出工作区', 'coding.workspaces.create': '创建工作区', 'coding.workspaces.get': '获取工作区',
  'coding.workspaces.update': '更新工作区', 'coding.workspaces.delete': '删除工作区',
  'coding.repositories.list': '列出仓库', 'coding.repositories.create': '创建仓库', 'coding.repositories.get': '获取仓库',
  'coding.repositories.update': '更新仓库', 'coding.repositories.delete': '删除仓库',
  'coding.repositories.listFiles': '列出仓库文件', 'coding.repositories.readFile': '读取仓库文件',
  'coding.repositories.downloadFile': '下载仓库文件',
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
  'settings.models.list': '列出可用或自有模型', 'settings.models.create': '创建模型配置',
  'settings.models.get': '读取模型配置', 'settings.models.update': '更新模型配置', 'settings.models.delete': '删除模型配置',
  'settings.models.test': '测试模型连接与响应',
  'settings.channels.list': '列出渠道', 'settings.channels.update': '更新渠道',
  'settings.signingSecret.get': '读取用户令牌签名密钥', 'settings.signingSecret.regenerate': '重新生成用户令牌签名密钥',
  'chat.conversations.list': '列出 Chat 会话', 'chat.conversations.create': '创建 Chat 会话',
  'chat.conversations.get': '获取 Chat 会话', 'chat.conversations.update': '更新 Chat 会话',
  'chat.conversations.delete': '删除 Chat 会话', 'chat.conversations.generateTitle': '生成 Chat 会话标题',
  'chat.messages.send': '发送 Chat 消息并返回 JSON', 'chat.messages.stream': '流式发送 Chat 消息',
  'chat.messages.list': '列出 Chat 消息', 'chat.messages.get': '获取 Chat 消息',
  'chat.messages.delete': '删除 Chat 消息', 'chat.messages.deleteAll': '删除 Chat 会话全部消息',
  'chat.send': '创建或续接会话并返回 JSON', 'chat.stream': '创建或续接会话并流式发送',
  'coding.runners.list': '列出 Runner 配置', 'coding.models.list': '列出 Coding 模型',
  'coding.runners.create': '创建 Runner 配置', 'coding.runners.get': '获取 Runner 配置',
  'coding.runners.update': '更新 Runner 配置', 'coding.runners.delete': '删除 Runner 配置',
  'coding.runners.listImagePolicies': '列出 Runner 镜像策略',
  'coding.runners.instances.list': '列出 Runner 实例', 'coding.runners.instances.create': '创建 Runner 实例',
  'coding.runners.instances.get': '获取 Runner 实例', 'coding.runners.instances.update': '更新 Runner 实例',
  'coding.runners.instances.delete': '删除 Runner 实例',
  'coding.agents.list': '列出 Coding Agent', 'coding.agents.create': '创建 Coding Agent',
  'coding.agents.get': '获取 Coding Agent', 'coding.agents.update': '更新 Coding Agent',
  'coding.agents.delete': '删除 Coding Agent', 'coding.agents.getStatus': '查询用户 Runner 状态',
  'coding.agents.ensureRunnerInstance': '确保当前用户的 Runner 实例', 'coding.agents.streamStatus': '订阅用户 Runner 状态',
  'coding.modes.list': '列出 Coding 执行模式',
  'coding.sessions.create': '创建编码会话', 'coding.sessions.list': '列出编码会话',
  'coding.sessions.get': '获取编码会话', 'coding.sessions.update': '更新编码会话',
  'coding.sessions.archive': '归档编码会话', 'coding.sessions.getTools': '获取编码会话工具',
  'coding.sessions.generateTitle': '生成编码会话标题', 'coding.sessions.listFiles': '列出编码会话文件',
  'coding.sessions.uploadFile': '上传编码附件', 'coding.sessions.readFile': '读取编码会话文件',
  'coding.sessions.downloadFile': '下载编码文件原件', 'coding.sessions.createDownloadLink': '创建单次下载链接',
  'coding.toolCalls.resolve': '回填客户端工具结果',
  'coding.turns.start': '异步启动 Turn', 'coding.turns.get': '读取 Turn',
  'coding.turns.cancel': '取消 Turn', 'coding.turns.steer': '向 Turn 插话',
  'coding.events.list': '读取历史事件', 'coding.events.stream': '持续订阅编码事件',
  'coding.interactions.list': '列出交互', 'coding.interactions.resolve': '处理交互',
  'coding.git.diff': '查看代码差异', 'coding.git.commit': '提交代码',
  'coding.git.push': '推送代码', 'coding.git.createPullRequest': '创建 Pull Request',
  'coding.git.getIdentity': '获取当前用户的 Git 身份', 'coding.git.updateIdentity': '更新当前用户的 Git 身份',
  'qa.list': '列出问答对', 'qa.create': '创建或更新问答对', 'qa.get': '获取问答对',
  'qa.update': '更新问答对', 'qa.delete': '删除问答对', 'qa.batchDelete': '批量删除问答对',
  'qa.search': '搜索问答对', 'qa.match': '匹配问答对',
  'files.extract': '提取文件文本', 'memories.filterContents': '高级过滤记忆内容',
  'memories.list': '列出记忆集合', 'memories.create': '创建记忆集合', 'memories.get': '获取记忆集合',
  'memories.update': '更新记忆集合', 'memories.delete': '删除记忆集合', 'memories.listContents': '列出记忆内容',
  'memories.upsertContent': '创建或更新记忆内容', 'memories.createContentsBatch': '批量创建记忆内容',
  'memories.getContent': '获取记忆内容', 'memories.updateContent': '更新记忆内容', 'memories.deleteContent': '删除记忆内容',
  'memories.listContentChunks': '列出内容分块', 'memories.searchChunksByEmbedding': '检索记忆分块',
  'memories.searchContentsByEmbedding': '检索记忆内容', 'memories.getEmbeddingQueueStats': '获取向量队列状态',
  'memories.listContentEmbeddingJobs': '列出内容的向量任务',
  'memories.rebuild': '重建记忆嵌入', 'memories.listFailures': '查询记忆处理失败内容',
};

export const operationNotes: Record<string, string> = {
  'agents.create': 'system 类型由平台预置；创建自有 Agent 时使用 custom 或 runner。',
  'agents.delete': '删除默认 Agent 时，可通过 new_default_id 指定新的默认 Agent。请在调用前确认目标。',
  'coding.keys.rotate': '仅允许 ek；必须提供当前密钥的 fingerprint，确认目标后执行轮换。',
  'sessions.create': 'skills 省略或为 null 时继承 Agent 技能；[] 禁用本会话技能。编码任务使用 coding.sessions，由应用 Coding 配置确定 provider。',
  'sessions.update': 'custom_data 等对象的合并、替换和清空语义以字段说明为准，SDK 直接传递输入。',
  'sessions.uploadFile': 'file 接受 File、Blob 或 {blob, filename}。省略 path 上传不可变附件并获取 file ID；提供非空 path 保留旧工作区上传方式。SDK 自动生成 multipart boundary。',
  'messages.send': '使用 MessagesSendInput。SDK 固定发送 stream: false；输入中不包含 stream 字段。',
  'messages.stream': '与 messages.send 使用同一个 HTTP 操作和 MessagesSendInput；SDK 固定发送 stream: true。返回异步迭代器，须先 await，再 for await。',
  'messages.deleteAll': '此调用删除指定会话的全部消息，请确认 sessionId。',
  'skills.validateBundle': '支持 JSON 文本文件列表或 ZIP 包。包内必须恰好有一个 SKILL.md；二进制文件使用 ZIP。ok: false 属于业务结果，不会自动抛出异常。',
  'skills.publishRevision': '支持 JSON 文件列表或 ZIP 包；版本号由服务端返回。二进制文件使用 ZIP。',
  'settings.models.list': '默认使用 ek 获取应用可用目录；传 {tokenType: "admin"} 使用 ak 获取自有管理目录。调用模型使用 model_id，不使用数字记录 id。',
  'settings.models.test': '此操作会实际调用模型并消耗额度，仅在明确需要验证时调用；doctor() 默认不调用它。',
  'coding.events.stream': '此端点已纳入正式 OpenAPI。约每 20 秒发送心跳，连接约 60 秒关闭；EOF 不表示任务完成，使用 after_seq 或 options.headers 中的 Last-Event-ID 手动恢复。合法 error 事件不是终态，后续仍可收到 turn.failed；turn 终态不主动结束会话流。',
  'coding.interactions.resolve': '成功只表示决策已接收并排队。session.updated 的 payload 包含 turn_id 和 plan_mode，表示实际计划模式变化；对应 Turn 的 turn.completed 才表示任务完成。',
  'coding.agents.create': '先在应用控制台配置 Coding 环境，再提供 name 创建 Agent；无需传 runner_profile_id。',
  'coding.agents.getStatus': '默认以 ek 查询当前用户；使用 {tokenType: "admin"} 时必须提供 external_user_id。用户令牌不能覆盖用户范围。',
  'coding.agents.streamStatus': '权限与 getStatus 相同。状态 SSE 返回 ZAIRunnerStatusStreamEvent，data 为 unknown；正常 EOF 结束，不要求 [DONE]，不自动重连。',
  'coding.agents.ensureRunnerInstance': '仅使用 ek 确保当前用户实例；202 表示已接受，仍需查询状态确认就绪。',
  'coding.sessions.create': '不再接受 provider 或 runner_id；通过 mode、plan_mode、system_prompt 和 primary_repo_key 配置会话行为。system_prompt 已移除规范中的 16,000 字符限制，不代表模型上下文或服务资源无限制。',
  'coding.sessions.generateTitle': '生成标题可能调用模型并消耗额度，保持显式调用。',
  'coding.sessions.uploadFile': 'input 接受 Blob（包含 File），文件名通过 name 查询参数传递；按 application/octet-stream 发送原始内容，允许零字节。返回 id 用于 attachment_ids。',
  'coding.sessions.downloadFile': '原件下载只允许 ek；file_id 与 path 必须恰好提供一个，返回 Blob。',
  'coding.sessions.createDownloadLink': 'file_id 与 path 必须恰好提供一个；链接最多有效十分钟且仅可使用一次，不要持久化到消息中。',
  'coding.toolCalls.resolve': '仅使用 ek；input 必填且 output/error 恰好一项。output: null 合法；error 需要 code 和 message。SDK 检查实际序列化内容后再获取令牌。',
  'coding.runners.create': '旧客户端兼容接口；新应用通过控制台保存应用级 Coding 配置。',
  'coding.runners.update': '旧客户端兼容接口；新应用通过控制台更新应用级 Coding 配置。',
  'coding.runners.delete': '旧客户端兼容接口；删除前确认没有依赖该 Profile 的实例。',
  'coding.repositories.update': 'HTTP 202 表示已接受更新，不代表仓库已就绪。',
  'coding.repositories.downloadFile': '允许 ak/ek，默认 ek，返回 Blob。path 相对仓库根目录，缺失或为空返回 404，Runner 离线返回 503。此接口与仅允许 ek 的会话附件原件下载分别处理。',
  'memories.rebuild': '重建嵌入可能消耗模型额度，显式调用后通过状态和失败内容查询跟踪结果。',
  'chat.send': '输入 content 是文本，返回值未声明 conversation ID。需要继续对话时优先显式创建并保存会话 ID。',
  'chat.stream': '便捷发送的 SSE 变体；SDK 固定 stream: true。',
  'settings.signingSecret.regenerate': '密钥轮换会使旧 ek 签名失效。成功后重新创建持有缓存的 provider/client；SDK 不自动轮换或重试请求。',
  'files.extract': 'file 接受 File、Blob 或 {blob, filename}。规范描述必填但没有 required，类型按正式 Schema 保留可选；实际调用应提供文件。',
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
${code(`import {createZAIClient} from 'zai-sdk';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('缺少环境变量：' + name);
  return value;
}

const client = createZAIClient({
  baseUrl: required('ZAI_BASE_URL'), // 例如 https://zai.example.com/v1/zai
  auth: {
    mode: 'auto',
    appID: required('ZAI_APP_ID'),
    appKey: required('ZAI_APP_KEY'),
    userID: required('ZAI_USER_ID'),
  },
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
      body: `<p>在 Vite 等 ESM 应用中导入 SDK。业务后端保存 <code>appKey</code>，根据当前登录用户签发 ek；前端只获取 <code>{token, expiresAt}</code>。</p>
${code(`import {createZAIClient, createZAITokenProvider} from 'zai-sdk';

const client = createZAIClient({
  baseUrl: '/v1/zai', // 同源代理；跨域时填写完整 API 根地址
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

const {agents} = await client.agents.list();
console.log(agents);`, 'typescript', true)}
<h3>普通 script 引入 UMD 单文件</h3>
<p><code>pnpm build:umd</code> 生成自包含的 <code>dist/zai.js</code>；<code>pnpm build</code> 同时生成 ESM、类型声明和该 UMD 文件。复制到静态资源目录后，使用 <code>&lt;script src="/assets/zai.js"&gt;&lt;/script&gt;</code> 加载，在后续普通脚本中通过 <code>ZAI.createZAIClient</code>、<code>ZAI.createZAITokenProvider</code> 使用上述 API，无需额外 JS、CSS 或模块加载器。UMD 与 ESM 的运行时导出相同，仍要求支持原生 Fetch、Streams 等 API 的现代浏览器。</p>
<p>UMD 随 npm 包分发，可通过 <code>zai-sdk/zai.js</code> 子路径定位为静态资源。不要将它当作 ESM 入口导入。<code>OUT=/path/to/public/zai pnpm build:umd</code> 可指定目标目录，只写入 <code>zai.js</code>，不会清空目录。封装 <code>@zentao/zai</code> 时，由 <code>LibLoader</code> 加载该文件并检查全局 <code>ZAI</code>。</p>
<p><code>/api/zai/token</code> 是需要由你的应用实现的业务接口，并非 SDK 内置接口。跨域部署时，服务端需允许应用来源、相应 HTTP 方法和 <code>Authorization</code> 等请求头；也可通过业务后端同源代理访问。</p>`,
    },
    {
      id: 'authentication', title: 'Token 与自动续期', description: '选择 Token 来源，理解有效期和并发刷新。',
      body: `<p>服务端推荐 <code>auth: {mode: 'auto', appID, appKey, userID}</code>。每个接口区分仅 ak、共享 ak/ek 和仅 ek 权限；自动模式为管理员接口选择 ak，其余默认选择 ek。共享接口可在请求选项中通过 tokenType 显式选择，固定权限接口拒绝冲突选项。<code>auth</code> 与 <code>getToken</code> 互斥。完整权限及来源列在每个接口中。令牌类型正确后，服务端仍检查应用与用户归属。</p>
<h3>独立获取管理员或用户令牌</h3>
${code(`import {createZAIToken, createZAITokenProvider} from 'zai-sdk';

const credentials = {appID: 'your-app-id', appKey: 'server-side-app-key', userID: 'user-123', userName: '小明'};
const ak = createZAIToken(credentials.appID, credentials.appKey, credentials.userID);
const getAdminToken = createZAITokenProvider({credentials}); // tokenType 默认为 admin
const getUserToken = createZAITokenProvider({
  credentials,
  tokenType: 'user',
  baseUrl: 'https://zai.example.com/v1/zai',
  expiresInSeconds: 1000,
  refreshBeforeSeconds: 60,
  signingSecretTimeoutMs: 30_000,
});
const ek = await getUserToken();`, 'typescript', true)}
<p>ak 直接使用应用 API Key 本地签发。首次获取 ek 时，SDK 用相同应用及用户签发 ak，读取 <code>GET /signing_secret</code>，核对应用 ID、签名密钥和令牌前缀，再本地签发 ek。自动模式复用客户端的 fetch 和 headers。SDK 从不自动调用密钥生成或轮换接口。</p>
<p>两种令牌均使用小写 MD5、UTF-8 JSON/Base64 和秒级过期时间，支持中文及 emoji。可选 <code>userName</code> 写入 <code>user_name</code>，不参与 hash。同步管理员方法保留 <code>createZAIToken(appID, appKey, userID, expiredTime?, userName?)</code>。</p>
<div class="table-wrap"><table><thead><tr><th>配置</th><th>默认值</th><th>行为</th></tr></thead><tbody>
<tr><td>tokenType</td><td>admin</td><td>credentials 模式可选 user；user 必须提供 baseUrl。</td></tr>
<tr><td>expiresInSeconds</td><td>1000</td><td>本地签发的有效期，必须为正整数。</td></tr>
<tr><td>refreshBeforeSeconds</td><td>60</td><td>剩余秒数不超过窗口时，在下次请求前刷新。</td></tr>
<tr><td>signingSecretTimeoutMs</td><td>30000</td><td>获取签名密钥的独立超时。</td></tr>
</tbody></table></div>
<p>Token 和 signing secret 仅缓存在当前 provider／自动鉴权实例内。并发首次获取共享一次网络请求，普通 ek 续期只重新本地签名；失败不缓存，下次可重试。取消单个业务请求不会取消其他请求共享的密钥获取。没有后台刷新定时器。</p>
${note('切换用户或轮换 signing secret 后，重新创建 provider/client 以清除旧密钥与 Token 缓存。SDK 不在 401/403 后升级为 ak 或重放请求，也不自动重连已有 SSE。')}
<p>浏览器继续使用 <code>fetchToken</code>，由业务后端返回 <code>{token: 'ek-…', expiresAt}</code>。<code>expiresAt</code> 和同步方法的 <code>expiredTime</code> 都是 Unix 秒。</p>
<h3>自定义 getToken 按接口权限选择令牌</h3>
<p>回调签名为 <code>(admin: boolean) =&gt; string | Promise&lt;string&gt;</code>。SDK 在每次发送请求前传入权限标记：true 表示此次请求选择 ak；false 表示选择 ek（含仅用户接口）。回调只收到该布尔值，不接收路径等其他接口参数。选择发生在请求前，不是收到 403 后重试；SDK 不解码返回的令牌。</p>
${code(`import {createZAIClient, createZAITokenProvider} from 'zai-sdk';

const baseUrl = 'https://zai.example.com/v1/zai';
const credentials = {appID: 'your-app-id', appKey: 'server-side-app-key', userID: 'user-123'};
// 两个 provider 分别缓存和续期 ak、ek。
const getAdminToken = createZAITokenProvider({credentials});
const getUserToken = createZAITokenProvider({credentials, tokenType: 'user', baseUrl});
const client = createZAIClient({
  baseUrl,
  getToken: admin => admin ? getAdminToken() : getUserToken(),
});

await client.agents.list(); // 调用 getToken(false)
await client.settings.models.list(); // 调用 getToken(true)`, 'typescript', true)}
<p>无参回调和直接传入固定类型的 provider 仍兼容，但会忽略 admin，不会自动切换令牌类型；只返回 ek 的 provider 不能用于管理员接口。自定义缓存应分别管理 ak、ek，其缓存和续期由调用者负责。auth 自动模式与 getToken 仍然互斥。</p>`,
    },
    {
      id: 'requests', title: '客户端与请求配置', description: 'API 地址、请求头、取消、超时和分页约定。',
      body: `<p><code>createZAIClient(options)</code> 返回 <code>ZAIClient</code>。<code>baseUrl</code> 必须包含 <code>/v1/zai</code>，Node.js 使用完整 HTTP(S) 地址；浏览器也支持相对地址。地址不能包含用户名、密码、查询参数或 fragment。</p>
<div class="table-wrap"><table><thead><tr><th>CreateZAIClientOptions</th><th>类型</th><th>说明</th></tr></thead><tbody>
<tr><td><code>baseUrl</code> <b class="required">必填</b></td><td>string</td><td>API 根地址，例如 https://zai.example.com/v1/zai。</td></tr>
<tr><td><code>auth</code></td><td>ZAIAutoAuthOptions</td><td>服务端自动按接口权限选择令牌；与 getToken 二选一。</td></tr>
<tr><td><code>getToken</code></td><td>(admin: boolean) =&gt; string | Promise&lt;string&gt;</td><td>每次请求前调用；true 需 ak，false 允许 ak/ek、推荐 ek。可用两个 provider 分别缓存并按标记选择。</td></tr>
<tr><td><code>fetch</code></td><td>typeof globalThis.fetch</td><td>可选，自定义 Fetch；默认使用原生 Fetch。</td></tr>
<tr><td><code>headers</code></td><td>HeadersInit</td><td>可选，所有请求的默认请求头。</td></tr>
</tbody></table></div>
<p>资源方法按路径顺序接收 ID，再接收查询参数或请求体，最后是可选的 <code>ZAIRequestOptions</code>（<code>signal?: AbortSignal</code>、<code>headers?: HeadersInit</code>）。接口字段保留 snake_case；ID 使用字符串，不要预先 URL 编码。</p>
${code(`// client 已按快速开始创建。
const page = await client.sessions.list({page: 1, page_size: 20});
console.log(page);

// 跳过可选查询参数，但传入请求选项。
await client.sessions.list(undefined, {
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
<p>请求级 headers 覆盖同名默认 headers。SDK 根据返回模式和请求体设置 <code>Accept</code>、<code>Content-Type</code>，并用自动选择或 <code>getToken</code> 提供的令牌设置 <code>Authorization: Bearer …</code>。无需手动设置这些协议头。</p>
<p>请求选项 <code>idempotencyKey</code> 优先于同名请求头。对于契约要求幂等键的 11 个写操作，两者都未提供时使用 Web Crypto 自动生成。显式键必须非空且为 1–128 字符；每次独立调用生成新键。业务重试须自行保存并复用原键，SDK 不自动重试。</p>
<p>列表每次只读取一页，保留服务端分页结构。会话列表的 <code>page</code> 从 1 开始，<code>page_size</code> 默认为 20、最大 100。分页循环、缓存和重试由应用决定。</p>`,
    },
    {
      id: 'doctor', title: '连接与功能检查', description: '逐项诊断配置、协议、鉴权与 Agent，可选验证真实对话。',
      body: `<p><code>client.doctor(options?)</code> 返回 <code>Promise&lt;ZAIDoctorResult&gt;</code>。默认只读取 Agent 列表，不查询管理员模型目录、不创建会话，也不调用模型测试、标题生成或记忆重建。<code>onChange</code> 在每项检查完成后接收 <code>ZAIDoctorDetail</code>，可用于展示诊断进度。</p>
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
<p>默认检查顺序为 <code>config</code>、<code>httpProtocol</code>、<code>server</code>、<code>agents</code>。连接检查读取 Agent 列表，验证当前 Token 可用；Agent 列表接受 runner 类型；聊天探针选择活跃的 custom Agent。优先选择默认的活跃 custom Agent，再选择首个符合条件的 Agent；指定 agentId 时检查该 Agent；指定 model 时仅在显式开启的聊天探针中交由真实响应验证。未指定模型时，真实对话使用服务端默认模型。</p>
<p>配置、协议或连接失败时提前结束；没有活跃 custom Agent 时不发送聊天探针。<code>details</code> 仅包含已执行的检查，<code>pass</code> 表示这些检查全部通过。客户端构造配置错误仍由 <code>createZAIClient()</code> 抛出；检查过程中的请求错误保留为 <code>detail.error</code>，不会因普通检查失败拒绝 Promise。<code>onChange</code> 回调异常会在尝试必要清理后继续抛出。</p>
${note('<code>chat: true</code> 会创建临时会话并消耗少量模型用量，增加 <code>chat</code> 和 <code>cleanup</code> 检查。会话禁用技能和记忆检索，消息使用空工具列表及 schema-only 模式；只发送一条短消息。')}
<p><code>timeoutMs</code> 默认 30,000，必须为 1 至 2,147,483,647 的整数，作用于每个请求及其 Token 获取，不是整个诊断的总时长。支持 <code>headers</code> 和 <code>signal</code>。即使对话失败或取消，也会用独立的超时请求尝试删除本次创建的会话。清理失败使整体检查失败，返回的 <code>sessionId</code> 可用于后续处理；会话创建响应丢失时无法确定 ID，也无法自动清理。</p>
<p>浏览器支持相对地址，检查 HTTPS 页面访问 HTTP API 的混合内容问题（回环地址除外）；CORS 等问题通过实际请求报告。诊断不推断服务版本和 embedding 能力，也不验证 SSE、文件、技能和 Runner 运行状态。</p>`,
    },
    {
      id: 'conversation', title: '会话与消息', description: '创建会话，选择模型与技能，发送文本和文件引用。',
      body: `<p>先选择一个可用 Agent，再创建会话。在同一个 <code>session.id</code> 下发送多条消息以延续对话。需要指定模型时使用服务端配置的 model_id；<a href="#api-settings-models-list">settings.models.list()</a> 默认使用 ek 返回应用可用模型目录。</p>
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
<p>消息内容支持 <code>input_text</code>、<code>input_image</code> 和 <code>input_file</code>。图片及文件通过 <code>file_id</code> 或旧工作区 <code>path</code> 引用文件，至少提供其中一项，也可同时提供；可附带 <code>mime_type</code> 和 <code>name</code>。具体字段及工具配置见 <a href="#api-messages-send">messages.send()</a>。</p>
<p>编码任务使用独立的 coding.sessions，创建时绑定工作区，provider 来自应用 Coding 配置，不接受会话级覆盖。<code>custom_data</code> 原样传给服务端，SDK 不额外合并对象。</p>`,
    },
    {
      id: 'chat-guide', title: 'Chat 会话', description: '使用文本及 attachments，保留会话 ID 以继续对话。',
      body: `${code(`const conversation = await client.chat.conversations.create({title: '产品咨询'});
// 将这个 ID 存入业务会话，后续消息继续使用它。
const reply = await client.chat.messages.send(conversation.id, {
  content: '介绍一下产品功能',
  tool_execution_mode: 'schema-only',
});
console.log(reply);

const stream = await client.chat.messages.stream(conversation.id, {
  content: '给出一个例子',
  tool_execution_mode: 'schema-only',
});
for await (const event of stream) {
  if (event.type === 'done') break;
  console.log(event.data);
}`, 'typescript', true)}
<p>Chat 的 content 是文本，可另传 attachments；普通 messages 的 content 是 input_text/input_image/input_file 数组。两组资源各自遵循对应契约，响应结构也不同。<code>chat.send()</code> 和 <code>chat.stream()</code> 可通过 conversation_id 续接已有会话，省略则由服务端创建；便捷 JSON 响应没有声明会话 ID，因此需要后续对话时优先显式创建并保存 ID。</p>
<p>工具默认执行模式的描述存在矛盾，示例显式使用 schema-only。ConversationSettings 的正式 Schema 要求完整字段，传 settings 时应提供完整对象；只使用默认配置可省略 settings。</p>`,
    },
    {
      id: 'coding-guide', title: 'Coding 异步任务与事件', description: '配置应用环境、准备用户实例，创建会话后持续消费事件。',
      body: `<p>先在应用控制台保存 Coding 环境，再使用 ak 创建 Agent；只需提供 name。Profile 写接口用于旧客户端兼容，新应用无需传 runner_profile_id。随后使用 ek 配置用户的 SSH 密钥、Git 身份和工作区。</p>
${code(`const agent = await client.coding.agents.create({name: '开发助手'}); // ak
const key = await client.coding.keys.ensure(agent.id); // ek
console.log(key.public_key); // 将公钥授权给需要访问的 Git 仓库。
await client.coding.git.updateIdentity(agent.id, {name: '小明', email: 'user@example.com'});
const workspace = await client.coding.workspaces.create(agent.id, {name: '示例项目'});
const idempotencyKey = crypto.randomUUID(); // 保存到业务请求，重试创建会话时复用。
const session = await client.coding.sessions.create(agent.id, {
  workspace_id: workspace.id,
  title: '修复测试',
}, {idempotencyKey});
const status = await client.coding.agents.getStatus(agent.id, {session_id: session.id});
if (status.status !== 'ready') throw new Error('Runner 尚未就绪，请稍后查询状态');
const accepted = await client.coding.turns.start(session.id, {content: '分析当前测试失败原因'});
console.log(accepted); // HTTP 202 表示已接受，不代表任务完成。

const signal = AbortSignal.timeout(300_000);
let afterSeq = 0;
let terminal = false;
const textByTurn = new Map<string, string>();
while (!terminal) {
  signal.throwIfAborted();
  const stream = await client.coding.events.stream(session.id, {after_seq: String(afterSeq)}, {signal});
  for await (const event of stream) {
    if (event.data.seq <= afterSeq) continue;
    // 只拼接文本增量；空文本事件也必须推进游标。
    if (event.data.type === 'message.delta' && event.data.turn_id && typeof event.data.payload.text === 'string') {
      const turnId = event.data.turn_id;
      textByTurn.set(turnId, (textByTurn.get(turnId) ?? '') + event.data.payload.text);
    }
    afterSeq = event.data.seq;
    console.log(event.id, event.event, event.data);
    // 审批接受或 session.updated 都不是任务完成。
    if (event.data.turn_id === accepted.id && ['turn.completed', 'turn.failed', 'turn.canceled'].includes(event.data.type)) {
      terminal = true;
      break;
    }
  }
  if (!terminal) await new Promise(resolve => setTimeout(resolve, 1000));
}
console.log(textByTurn, afterSeq);
// 正常 EOF 用 afterSeq 续接；异常交给调用方处理。
// 不再需要会话时调用 client.coding.sessions.archive(session.id)。`, 'typescript', true)}
<p>会话不接受 provider 或 runner_id 覆盖；响应记录 runner_profile_id、runner_instance_id 和 runner_profile_version。通过 mode、plan_mode、system_prompt、primary_repo_key 配置会话；首次读取事件使用 after_seq: "0"，恢复时使用最后处理完的事件游标，也可通过 events.list 回放历史。仓库更新的 202 同样仅表示已接受。SDK 不自动轮询、重连、执行交互审批或 Git 写操作。</p>
<p>Coding SSE 已纳入正式 OpenAPI，协议详见 <a href="https://zai-dev.sh.oop.cc/docs/zai/coding/events">在线事件流文档</a>。数据帧保留 id、event、rawData 和完整事件对象；忽略约每 20 秒一次的心跳，连接约 60 秒关闭，EOF 不代表 turn 成功。合法 error、完成、失败和取消均作为数据事件传递，无需 [DONE]。可用 after_seq 或 options.headers 中的 Last-Event-ID 续接；同一个截止时间覆盖全部连接，按 seq 去重。非事件信封的通道错误和畸形事件抛错，取消或提前退出释放连接。</p>
<p>交互审批成功只表示决策已接收并排队。session.updated 的 payload.turn_id、payload.plan_mode 表示实际模式变化；等待对应 Turn 的 turn.completed 确认任务完成。创建会话的 system_prompt 不再声明 16,000 字符上限，模型和服务的实际容量仍需分别考虑。</p>
<h3>用户 Runner 状态流</h3>
${code(`const statusStream = await client.coding.agents.streamStatus('your-agent-id');
for await (const snapshot of statusStream) {
  // snapshot.data 是 unknown，按状态协议缩小类型后使用。
  console.log(snapshot.event, snapshot.id, snapshot.data);
}
// 管理员必须明确指定目标用户。
const status = await client.coding.agents.getStatus('your-agent-id', {
  external_user_id: 'your-user-id',
}, {tokenType: 'admin'});`, 'typescript', true)}
<p>getStatus 和 streamStatus 默认使用 ek 查询当前用户，用户令牌不可覆盖 external_user_id；ak 查询必须提供该字段。ensureRunnerInstance 只允许 ek 操作当前用户。状态 SSE 保留 event、id、rawData，data 为 unknown；正常 EOF 结束，不要求 [DONE]，不自动重连。</p>
<h3>附件与客户端工具</h3>
${code(`const uploaded = await client.coding.sessions.uploadFile('your-session-id', {name: 'report.txt'}, new Blob(['报告正文']));
await client.coding.turns.start('your-session-id', {
  content: '总结附件', attachment_ids: [uploaded.id],
});
const blob = await client.coding.sessions.downloadFile('your-session-id', {file_id: uploaded.id});
console.log(await blob.text());
await client.coding.toolCalls.resolve('your-session-id', 'your-tool-call-id', {output: null});`, 'typescript', true)}
<p>Coding 上传按 application/octet-stream 发送原始 Blob，返回 id 供 attachment_ids 引用。原件下载只允许 ek；下载和创建单次链接时，file_id/path 恰好提供一个。单次链接不要持久化到消息中。工具回填只允许当前用户，output/error 恰好一项；output: null 合法，error 必须包含 code/message。</p>`,
    },
    {
      id: 'settings-guide', title: '应用管理员配置', description: '管理模型、渠道与签名密钥。',
      body: `${code(`// 使用 auth.mode: 'auto' 的服务端客户端，以下调用自动选择 ak。
const models = await client.settings.models.list({tokenType: 'admin'});
const channels = await client.settings.channels.list();
console.log(models, channels);`, 'typescript', true)}
<p>模型记录的数字 id 用于管理接口，模型调用使用字符串 model_id。settings.models.list 默认使用 ek 查询应用可用目录，显式选择 admin 才返回自有管理目录。其他 settings、Runner 配置/实例管理、Coding Agent 管理和部分 Memories 操作需要 ak；各接口会显示具体要求。不要将应用 API Key 或 signing secret 交给浏览器。</p>
<p><code>settings.signingSecret.get()</code> 读取 ek 签名密钥。仅在主动安排轮换时调用 <code>regenerate()</code>；轮换后重新创建服务端 provider/client。SDK 不自动轮换，也不在鉴权失败后改用更高权限重放。</p>`,
    },
    {
      id: 'migration', title: '升级到 0.3.0', description: 'Runner 配置、附件、幂等键、权限和事件协议的变化。',
      body: `<h3>从 0.2.x 升级</h3><p>0.3.0 直接适配新版契约。Coding 会话移除 provider/runner_id 覆盖，响应新增 Profile、Instance 和版本信息；创建 Agent 仅需 name。模型列表默认使用 ek，管理目录显式传 tokenType: "admin"。密钥轮换需要 fingerprint，Coding 模型查询需要 agent_id。</p>
<p>11 个写操作自动生成幂等键；重试应复用原键。仓库更新与 Turn 的 202 表示接受，不表示就绪或完成。普通附件可用 file_id/path，Coding 上传后以 attachment_ids 引用；原件下载仅允许 ek，单次链接不持久化到消息。合法 Coding error 事件继续传递，仍需读取 turn.failed；只拼接 message.delta，空文本事件也推进游标。</p>
<p>模型测试、标题生成和记忆重建可能消耗额度，均保持显式调用；doctor 默认不增加这些行为。完整迁移说明和 0.1→0.2 历史保留在随包提供的 MIGRATION.md。</p>
<h3>从 0.1.x 升级的历史变化</h3><p>根地址从 /v8 改为 /v1/zai；旧顶层 executor、workspaces、repositories、models 已移除。工作区、仓库和公钥进入 coding；models 改为 settings.models。实体字段 integration_id 改为 app_id，Agent 类型 executor 改为 runner；普通会话不再使用 executor_provider。</p>
<p>工作区和仓库更新使用 PUT；仓库文件列表返回 entries，内容可能是 base64 或被截断，旧仓库下载无替代端点。模型管理不支持 all，也不再归一化旧模型数组。同步管理员签发保留位置参数并改用 UTF-8；用户令牌通过应用 API Key 获取签名密钥后生成。</p>
<p>当前原始规范已包含 Coding SSE，共 100 条路径、153 个 HTTP 操作、156 个资源方法。新增 coding.repositories.downloadFile 返回 Blob；仓库响应新增必填 relative_path，构造响应对象时需补齐。supplement 当前为空并保留包导出。三个消息发送端点各有 send/stream 两种方法；doctor 是额外的辅助方法。完整迁移说明随包提供 MIGRATION.md。</p>
<h3>保留的规范缺口</h3><ul>
<li>Memories、QA、文件提取的部分描述写“必填”，但 Schema 未设置 required；类型遵循正式 Schema，示例仍提供业务必需值。</li>
<li>SettingsModel.model_type 的 nullable 类型与 enum 不一致；不推测性扩充生成类型。</li>
<li>单条 ChatMessage 的 allOf 写法没有表达预期 nullable，按正式类型处理。</li>
<li>Chat 工具默认执行模式描述互相矛盾，示例显式指定执行模式。</li>
<li>Conversation settings 描述支持默认值合并，但引用 Schema 要求完整字段；传 settings 时提供完整对象。</li>
</ul><p>原始 OpenAPI 保留原样；补充规范只增补有文档依据且原始规范缺失的路径，当前 paths 为空。权限要求来自规范和鉴权文档，离线测试不等于服务端逐接口权限验收。</p>`,
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
<p>普通会话上传的 path 可省略：省略时返回不可变附件 id，消息通过 file_id 引用；返回 id 为可选字段，使用前先检查。传入非空 path 仍可上传到旧工作区。<code>readFile()</code> 返回 JSON，<code>downloadFile()</code> 返回 Blob。仓库内容读取需根据 encoding 解码 base64 并检查 truncated；获取原始二进制使用 <code>coding.repositories.downloadFile()</code>，path 相对仓库根目录。</p>
${code(`const repositoryFile = await client.coding.repositories.downloadFile(
  'your-agent-id', 'your-workspace-id', 'your-repository-id',
  {path: 'docs/report.pdf'},
);
console.log(repositoryFile.size);`, 'typescript', true)}
<h3>直接提取文件文本</h3>
${code(`const extracted = await client.files.extract({
  file: {blob: new Blob(['报告正文'], {type: 'text/plain'}), filename: 'report.txt'},
});
console.log(extracted);`, 'typescript', true)}`,
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
<p>通过 <a href="#api-memories-create">memories.create()</a> 创建集合，写入内容后可查看 <code>embedding_status</code> 和 <code>listContentEmbeddingJobs()</code>。不要将写入成功视为向量处理已完成；需按服务端同步状态决定何时检索。可通过 listFailures 查询失败内容；rebuild 重建嵌入可能消耗模型额度，仅在明确需要时调用。</p>`,
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
<p><code>ZAIClientError</code> 继承 Error，包含 <code>code</code>；还可包含 <code>status</code>、<code>body</code>、<code>method</code>、<code>path</code>、<code>headers</code>、<code>cause</code>。这些可选字段只在信息可用时存在。结构有效的服务端 error_info 会提取为 errorInfo（ZAIErrorInfo），包含 code、message、reason_code、user_message、details 和可选 retryable；原始 body 与 SDK 错误分类不变。根据 SDK code 分支，避免依赖错误文案。</p>
<details class="faq"><summary>为什么返回了 ok: false，却没有抛出异常？</summary><p>正常 HTTP 响应内的业务结果原样返回。请检查 ok、success 等字段，按相应接口处理。</p></details>
<details class="faq"><summary>原来的 models.list 在哪里？</summary><p>settings.models.list 默认用 ek 查询应用可用目录，传 {tokenType: "admin"} 查询自有管理目录；其他模型管理操作需要 ak。不再支持 all。数字 id 标识配置记录，调用模型使用 model_id。</p></details>
<details class="faq"><summary>SDK 会自动重试、重连或执行工具吗？</summary><p>不会。缓存、重试、工具执行和 UI 状态由应用负责；尤其是消息发送、创建或删除操作，重试前应确认上一次请求的结果。</p></details>
<details class="faq"><summary>TypeScript 类型是否等于完整运行时校验？</summary><p>不是。SDK 校验传输协议和必要边界，但不会对所有返回 JSON 做完整 schema 校验。开放对象和 unknown 数据需由应用缩小类型。</p></details>`,
    },
  ];
}
