# ZAI SDK

面向 Node.js 22+ 和现代浏览器的 TypeScript SDK，提供 ESM 和 UMD 单文件。0.3.0 使用 `/v1/zai`，覆盖原始 OpenAPI 的 151 个操作，并按官方文档补充 Coding SSE：共 **99 条路径、152 个 HTTP 操作、155 个资源方法**。

中文完整文档在 [`docs/index.html`](./docs/index.html)，包含每个接口的权限、来源、字段、调用签名和可复制示例。页面可离线打开，无需启动服务。升级旧项目请先阅读 [`docs/MIGRATION.md`](./docs/MIGRATION.md)。

## 安装与开始使用

```sh
pnpm install
pnpm build
pnpm pack --pack-destination /tmp/zai-sdk-pack
# 在消费项目中执行：
pnpm add /tmp/zai-sdk-pack/zai-sdk-0.3.0.tgz
```

服务端使用应用 API Key，SDK 按接口权限自动选择令牌：

```ts
import {createZAIClient} from 'zai-sdk';

const client = createZAIClient({
  baseUrl: 'https://zai.example.com/v1/zai',
  auth: {
    mode: 'auto',
    appID: process.env.ZAI_APP_ID!,
    appKey: process.env.ZAI_APP_KEY!,
    userID: 'user-123',
  },
});

const {agents} = await client.agents.list(); // ek
const agent = agents.find(item => item.type === 'custom' && item.status === 'active');
if (!agent) throw new Error('需要一个活跃的 custom Agent');
const {session} = await client.sessions.create(agent.id, {title: 'SDK 示例'});
const reply = await client.messages.send(session.id, {
  content: [{type: 'input_text', text: '用一句话介绍自己'}],
});
console.log(reply.content);

const models = await client.settings.models.list(); // ek，应用可用目录
const ownedModels = await client.settings.models.list({tokenType: 'admin'}); // ak，自有管理目录
```

`baseUrl` 是完整 API 根地址；浏览器可以使用同源 `/v1/zai`。`auth` 与 `getToken` 二选一。客户端支持自定义 `fetch`、默认 `headers`，资源方法最后接受 `{signal, headers, idempotencyKey, tokenType}`。路径 ID 按 URL 顺序传入字符串，输入字段保持 snake_case。

```ts
await client.sessions.list(undefined, {
  signal: AbortSignal.timeout(10_000),
  headers: {'X-Request-ID': 'request-123'},
});
```

## UMD 单文件

```sh
pnpm build:umd  # 仅生成 dist/zai.js
pnpm build     # 同时生成原有 ESM、类型声明和 dist/zai.js
```

`dist/zai.js` 内含全部运行时依赖，通过普通 `<script>` 加载后提供全局 `ZAI`，与 ESM 入口的运行时导出一致，无需额外 JS、CSS 或模块加载器。运行环境仍为支持原生 Fetch、Streams 等 API 的现代浏览器。

```html
<script src="/assets/zai.js"></script>
<script>
  const client = ZAI.createZAIClient({
    baseUrl: '/v1/zai',
    getToken: ZAI.createZAITokenProvider({
      fetchToken: async () => {
        const response = await fetch('/api/zai/token');
        if (!response.ok) throw new Error('获取令牌失败');
        return response.json(); // {token: 'ek-...', expiresAt: <整数 Unix 秒>}
      },
    }),
  });
  client.agents.list().then(console.log).catch(console.error);
</script>
```

`/api/zai/token` 由业务后端提供，应用 API Key 和 signing secret 留在后端。UMD 文件随 npm 包分发，也可通过 `zai-sdk/zai.js` 子路径定位为静态资源；不要把它当作 ESM 入口导入，现有 `import ... from 'zai-sdk'` 和类型声明保持不变。

封装 `@zentao/zai` 时，可在本 SDK 目录运行以下命令，直接输出到扩展的静态资源目录，再由 `LibLoader` 加载 `zai/zai/zai.js` 并检查全局 `ZAI`：

```sh
OUT=../zui_exts/zentao/lib/zai/public/zai pnpm build:umd
```

`OUT` 相对于 SDK 根目录解析，也支持绝对路径。UMD 构建仅写入 `zai.js`，不清空目标目录；上述命令供创建扩展时使用。

## ak、ek 与自动续期

接口权限分为仅 ak、共享 ak/ek 和仅 ek。自动模式为管理员接口使用 ak，其余默认使用 ek；共享接口可通过 `tokenType` 显式选择。权限来自当前规范、[鉴权文档](https://zai-dev.sh.oop.cc/docs/authentication/app-api) 和 [Coding API](https://zai-dev.sh.oop.cc/docs/zai/coding/api) 的具体说明，服务端仍检查应用和用户归属。全部接口的权限和来源见 HTML 参考。

- ak：应用 API Key 直接本地签发，不请求服务端。
- ek：首次用相同应用及用户签发 ak，调用 `GET /signing_secret`，核对应用 ID、密钥及前缀后本地签发。
- 两者使用小写 MD5、UTF-8 JSON/Base64、秒级过期时间，支持中文和 emoji。可选 `userName` 写入 `user_name`，不参与 hash。

保留同步管理员签发与显式 provider：

```ts
import {createZAIToken, createZAITokenProvider} from 'zai-sdk';

const credentials = {appID, appKey, userID, userName: '小明'};
const ak = createZAIToken(appID, appKey, userID, undefined, '小明');
const getAdminToken = createZAITokenProvider({credentials}); // tokenType 默认 admin
const getUserToken = createZAITokenProvider({
  credentials,
  tokenType: 'user',
  baseUrl: 'https://zai.example.com/v1/zai',
  expiresInSeconds: 1000,
  refreshBeforeSeconds: 60,
  signingSecretTimeoutMs: 30_000,
});
const ek = await getUserToken();
```

Token 默认有效期 1000 秒，在下一次调用且剩余时间不超过 60 秒时续期。Token 和 signing secret 仅缓存于当前 provider／自动鉴权实例；并发首次获取共享一个请求，后续 ek 续期仅本地签名。密钥获取默认独立超时 30 秒；单个业务请求取消不取消共享获取。失败不缓存，后续调用可重试。

SDK 不自动生成或轮换密钥，不在 401/403 后改用 ak 重放，不因续期自动重连 SSE。切换用户或轮换 signing secret 后重新创建 provider/client。

浏览器从业务后端获取签好的 ek，不保存应用 API Key 或 signing secret：

```ts
const client = createZAIClient({
  baseUrl: '/v1/zai',
  getToken: createZAITokenProvider({
    fetchToken: async () => {
      const response = await fetch('/api/zai/token', {credentials: 'same-origin'});
      if (!response.ok) throw new Error('获取令牌失败');
      return response.json(); // {token: 'ek-...', expiresAt: <整数 Unix 秒>}
    },
  }),
});
```

`fetchToken` 与 `credentials` 互斥。自定义回调签名为 `getToken(admin: boolean): string | Promise<string>`。SDK 在每次发送请求前调用它：`true` 表示此次请求选择 ak；`false` 表示选择 ek（含仅用户接口）。共享权限接口允许通过请求选项 `tokenType` 显式选择；固定权限接口拒绝冲突选项。回调只接收这个布尔值，不接收路径等其他接口信息，SDK 不解码返回的令牌。

服务端需要自主管理令牌来源时，用两个 provider 分别缓存和续期 ak、ek：

```ts
const getAdminToken = createZAITokenProvider({credentials});
const getUserToken = createZAITokenProvider({
  credentials,
  tokenType: 'user',
  baseUrl: 'https://zai.example.com/v1/zai',
});
const client = createZAIClient({
  baseUrl: 'https://zai.example.com/v1/zai',
  getToken: admin => admin ? getAdminToken() : getUserToken(),
});
```

这一选择在请求前完成，不是收到 403 后重试。无参回调和直接传入固定类型的 provider 仍兼容，但它们会忽略 `admin`，不会自动切换令牌类型；例如只返回 ek 的 provider 不能调用管理员接口。自定义缓存应分别管理 ak 和 ek，避免共用一个缓存值。`auth.mode: 'auto'` 与 `getToken` 仍然互斥。

## 资源与调用方式

| 资源 | 能力 |
| --- | --- |
| `agents`、`sessions`、`messages` | 普通 Agent 会话、JSON/SSE 消息、上下文、文件及图片 |
| `chat.conversations`、`chat.messages`、`chat.send/stream` | 独立 Chat 会话，文本及 attachments |
| `coding.workspaces/repositories/keys` | 工作区、仓库文件、AGENTS.md、公钥 |
| `coding.sessions/turns/events/interactions/toolCalls` | 编码会话、附件、异步 turn、持续事件流、交互审批与客户端工具回填 |
| `coding.git/models/modes` | Git 身份与操作、Coding 模型及执行模式 |
| `coding.agents/runners/runners.instances` | Coding Agent、Runner 配置与用户实例、状态查询及状态流 |
| `skills`、`agentSkills` | 技能包、版本、校验与挂载 |
| `memories`、`qa`、`files.extract` | 记忆、问答、检索、过滤及文件文本提取 |
| `settings.models/channels/signingSecret` | 可用模型目录、应用管理员配置与模型测试 |

模型管理的数字 `id` 标识记录，调用模型使用 `model_id`。新版不提供旧顶层 `executor/workspaces/repositories/models`，仓库下载端点已删除。列表仅请求一页，保留相应接口原始返回结构，不再归一化旧模型数组。

```ts
// Chat content 是文本；普通 messages content 是数组。
const conversation = await client.chat.conversations.create({title: '产品咨询'});
const reply = await client.chat.messages.send(conversation.id, {
  content: '介绍产品功能',
  tool_execution_mode: 'schema-only',
});
```

显式创建并保存 Chat 会话 ID，便于后续对话。便捷 `chat.send()` 支持 `conversation_id`，但其 JSON 响应未声明新创建的会话 ID。

## Coding 接入与三种 SSE

三个消息发送端点均有 `send()` 和 `stream()`，分别固定 `stream:false/true`。消息 SSE 数据帧为 `{type:'data', event, id?, rawData, data}`，`data` 为 `unknown`；收到 `[DONE]` 产生 `{type:'done'}`。SDK 保留完整 chunk，不自动抽取文本或执行工具。

```ts
const stream = await client.messages.stream(session.id, {
  content: [{type: 'input_text', text: '解释一下这段代码'}],
});
for await (const event of stream) {
  if (event.type === 'done') break;
  console.log(event.event, event.data);
}
```

先在应用控制台保存 Coding 环境，使用 ak 创建 Coding Agent（只需 `name`），再用 ek 确保 SSH 密钥、配置 Git 身份、创建工作区和会话。查询状态就绪后启动 Turn。Profile 写接口保留供旧客户端兼容，不作为新应用配置入口。

Coding turn 启动及仓库更新返回 HTTP 202，只表示接受请求。`coding.events.stream()` 是独立持续会话流：保留 `id/event/rawData` 及完整事件对象，忽略心跳。合法 `error` 事件仍需继续读取后续 `turn.failed`；turn 完成、失败或取消仍是数据事件，不结束流；不要求 `[DONE]`，EOF 只表示连接结束。调用者保存事件游标，再通过 `after_seq` 手动恢复。[Coding 事件协议](https://zai-dev.sh.oop.cc/docs/zai/coding/events)

```ts
const idempotencyKey = crypto.randomUUID(); // 保存到业务请求，重试创建会话时复用。
const codingSession = await client.coding.sessions.create('runner-agent-id', {
  workspace_id: 'workspace-id',
}, {idempotencyKey});
const status = await client.coding.agents.getStatus('runner-agent-id', {session_id: codingSession.id});
if (status.status !== 'ready') throw new Error('Runner 尚未就绪');
await client.coding.turns.start(codingSession.id, {content: '分析测试失败原因'});
const events = await client.coding.events.stream(codingSession.id, {after_seq: '0'});
let afterSeq = 0;
for await (const event of events) {
  console.log(event.id, event.event, event.data);
  afterSeq = event.data.seq; // 空文本事件也推进游标，只拼接 message.delta。
}
console.log(afterSeq);
```

`coding.agents.streamStatus()` 返回独立的 Runner 状态流，保留 `event/id/rawData`，`data` 是 `unknown`，正常 EOF 结束，不要求 `[DONE]`。状态查询和状态流默认 ek；admin 查询须传 `external_user_id`，普通用户不可覆盖用户范围。`ensureRunnerInstance()` 仅允许 ek 操作当前用户。

三种流都支持 AbortSignal，迭代中 `break` 会释放连接；取得流但未开始迭代时可调用 `await stream.return()`。通道错误、无效 JSON/UTF-8、超过 1 MiB 的解析缓冲和读取异常会报错。消息流缺少 `[DONE]` 的 EOF 报错，Coding 流的 EOF 正常结束迭代；均不自动重连。

## 文件与诊断

上传接受 `File`、`Blob` 或 `{blob, filename}`，SDK 自动设置 multipart boundary。普通会话上传可省略 `path` 以取得不可变附件 ID；提供非空 `path` 保留旧工作区上传；消息的 `input_file/input_image` 至少提供 `file_id/path` 之一，也可同时提供。文本提取仅提供文件；技能可传 JSON 文件列表或 ZIP。规范未写 required 的文件字段仍在类型中保持可选，实际调用应提供文件。

```ts
await client.sessions.uploadFile(session.id, {
  path: 'input/report.txt',
  file: {blob: new Blob(['报告'], {type: 'text/plain'}), filename: 'report.txt'},
});
const text = await client.files.extract({
  file: {blob: new Blob(['报告'], {type: 'text/plain'}), filename: 'report.txt'},
});
```

Coding 上传使用原始 Blob，文件名放在 query，随后通过 `attachment_ids` 引用；原件下载仅允许 ek。下载与创建下载链接时 `file_id/path` 恰好提供一项。单次下载链接不要保存到消息中。

```ts
const uploaded = await client.coding.sessions.uploadFile('coding-session-id', {name: 'report.txt'}, new Blob(['报告']));
await client.coding.turns.start('coding-session-id', {content: '总结附件', attachment_ids: [uploaded.id]});
await client.coding.toolCalls.resolve('coding-session-id', 'tool-call-id', {output: null});
```

工具结果回填仅允许 ek，`output/error` 恰好一项；`output: null` 合法，`error` 必须有 `code/message`。模型测试、标题生成与记忆重建可能消耗额度，保持显式调用。

`doctor()` 默认检查配置、协议、连接和 Agent，不请求管理员模型目录。Agent 列表支持 runner；聊天探针仍选择活跃 custom Agent。仅显式 `chat:true` 才创建临时普通会话验证 JSON 对话，`model` 仅传入探针。失败和取消仍使用独立超时清理临时会话，清理失败使整体 `pass:false`。诊断不验证 SSE、Coding、文件或技能。

错误统一为 `ZAIClientError`，稳定 `code` 为 `authentication/http/network/aborted/invalid-input/invalid-response`。结构有效的服务端 `error_info` 会提取为 `errorInfo: ZAIErrorInfo`，保留 SDK 错误分类及完整 `body`；可读取 `reason_code/user_message/retryable/details`。正常 HTTP 内的 `ok:false` 等业务结果原样返回。

规范要求的 11 个写操作自动生成幂等键。`options.idempotencyKey` 优先于合并后的同名请求头；显式键必须非空且为 1–128 字符。每次独立调用生成新键，业务重试必须复用原键；SDK 不自动重试。

## OpenAPI 规范

原始 [`zai-openapi.json`](./zai-openapi.json) 和 Coding SSE 补充 [`zai-openapi.supplement.json`](./zai-openapi.supplement.json) 随安装包提供，分别通过 `zai-sdk/openapi.json`、`zai-sdk/openapi-supplement.json` 导出。

## 开发与验证

开发环境、构建测试、接口生成与提交约定统一维护在源码仓库的 [AGENTS.md](https://github.com/easysoft/zai-sdk/blob/main/AGENTS.md)。其中也提供文档维护、验证记录和真实服务测试的入口。

本版交付本地 SDK、文档和验证，不包含 npm 发布或消费项目迁移。
