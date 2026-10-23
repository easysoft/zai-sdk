# ZAI SDK

面向 Node.js 22+ 和现代浏览器的 TypeScript SDK，提供 ESM 和 UMD 单文件。0.3.1 使用 `/v1/zai`，覆盖当前原始 OpenAPI（含 Coding SSE）的 **100 条路径、153 个 HTTP 操作、156 个资源方法**。

中文完整文档在 [`docs/index.html`](./docs/index.html)，包含每个接口的权限、来源、字段、调用签名和可复制示例。页面可离线打开，无需启动服务。升级旧项目请先阅读 [`docs/MIGRATION.md`](./docs/MIGRATION.md)。

## 安装与开始使用

```sh
pnpm install
pnpm build
pnpm pack --pack-destination /tmp/zai-sdk-pack
# 在消费项目中执行：
pnpm add /tmp/zai-sdk-pack/zai-sdk-0.3.1.tgz
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
    allowedTokenTypes: ['user'],
    getToken: ZAI.createZAITokenProvider({
      acquireTimeoutMs: 30_000,
      fetchToken: async ({signal}) => {
        const response = await fetch('/api/zai/token', {signal});
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
- ek：可直接使用可信后端持有的 signing secret 本地签发；使用应用 API Key 时，首次用相同应用及用户签发 ak，调用 `GET /signing_secret`，核对应用 ID、密钥及前缀后本地签发。
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

后端已经持有 signing secret 时，无需应用 API Key 或 ZAI 网络请求即可同步签发 ek：

```ts
import {createZAIUserToken, createZAITokenProvider} from 'zai-sdk';

const identity = {appID: 'your-app-id', userID: 'user-123'};
const signingSecret = process.env.ZAI_SIGNING_SECRET!;
const ek = createZAIUserToken({
  ...identity,
  signingSecret,
  userName: '小明',
  expiresAt: Math.floor(Date.now() / 1000) + 1000,
});
const getUserToken = createZAITokenProvider({
  credentials: {...identity, signingSecret},
  tokenType: 'user',
});
```

`createZAIUserToken()` 的 `expiresAt` 默认为当前 Unix 秒加 1000，显式值必须为未来的整数 Unix 秒。直接密钥 provider 必须使用 `tokenType: 'user'`，不接受 `baseUrl`、`fetch` 或 `headers`。`credentials` 中的 `appKey`、`signingSecret` 和 `getSigningSecret` 必须恰好提供一种。

集中凭据服务可以通过 `getSigningSecret` 提供密钥：

```ts
const getUserToken = createZAITokenProvider({
  credentials: {
    appID: 'your-app-id',
    userID: 'user-123',
    getSigningSecret: async ({signal}) => {
      const response = await fetch('https://secrets.example.com/zai/signing-secret', {signal});
      if (!response.ok) throw new Error('获取签名密钥失败');
      return response.text(); // 由可信后端的凭据服务返回密钥。
    },
  },
  tokenType: 'user',
  signingSecretTimeoutMs: 30_000,
});
```

`getSigningSecret` 签名为 `(context: ZAITokenAcquisitionContext) => string | Promise<string>`，通过 `context.signal` 使用共享认证任务自己的取消信号。超时、`invalidate()` 或 `dispose()` 会中止任务，迟到结果不写回缓存；回调错误会脱敏，不包含原始错误内容。signing secret 能签发该应用下不同用户的 ek，并非用户级秘密；只在可信后端使用，不能下发浏览器。

Token 默认有效期 1000 秒，在下一次调用且剩余时间不超过 60 秒时续期。Token 和 signing secret 仅缓存于当前 provider／自动鉴权实例；并发首次获取共享一次密钥获取，后续 ek 续期仅本地签名。密钥获取默认独立超时 30 秒；单个业务请求取消不取消共享获取。失败不缓存，后续调用可重试。

可主动清除缓存或释放 provider：

```ts
getUserToken.invalidate(); // 仅清除 Token，下次获取时复用已缓存的 signing secret。
getUserToken.invalidate({signingSecret: true}); // 同时清除密钥，下次获取时重新读取。
const renewedEK = await getUserToken();
getUserToken.dispose(); // 退出登录时永久禁用这个 provider，可重复调用。
```

`invalidate()` 不发请求；它与 `dispose()` 都会中止进行中的认证获取，让等待者收到 `ZAIClientError`（`code: 'aborted'`），迟到的结果不会写回缓存。`dispose()` 后的获取始终失败，`invalidate()` 不能恢复已释放的实例。

`auth.mode: 'auto'` 客户端通过 `client.auth?.invalidate()`、`client.auth?.invalidate({signingSecret: true})` 和 `client.auth?.dispose()` 同时管理内部 ak、ek provider。自定义 `getToken` 客户端的 `client.auth` 为 `undefined`，由调用者持有并管理原 provider。这些操作只管理认证获取；已发出的业务请求或 SSE 通过该请求自己的 `AbortSignal` 取消。

SDK 不自动生成或轮换密钥，不在 401/403 后改用 ak 重放，不因续期自动重连 SSE。轮换 signing secret 成功后，清除相关 provider/client 的 Token 和密钥缓存，动态来源会重新读取。静态 `signingSecret` 清缓存后仍使用创建时的值，更换它、切换用户或更换应用 API Key 时应释放旧实例并重新创建。

浏览器从业务后端获取签好的 ek，不保存应用 API Key 或 signing secret：

```ts
const client = createZAIClient({
  baseUrl: '/v1/zai',
  allowedTokenTypes: ['user'],
  getToken: createZAITokenProvider({
    acquireTimeoutMs: 30_000,
    fetchToken: async ({signal}) => {
      const response = await fetch('/api/zai/token', {credentials: 'same-origin', signal});
      if (!response.ok) throw new Error('获取令牌失败');
      return response.json(); // {token: 'ek-...', expiresAt: <整数 Unix 秒>}
    },
  }),
});
```

`fetchToken` 与 `credentials` 互斥，签名为 `(context: ZAITokenAcquisitionContext) => ZAIToken | Promise<ZAIToken>`。将 `context.signal` 传给后端 `fetch`：超时、`invalidate()` 和 `dispose()` 都会中止它。它与业务请求的 signal 分开；取消一个业务请求不会中止其他请求共享的 Token 获取。

`acquireTimeoutMs` 仅用于 `fetchToken` 模式，默认 30,000，必须为 1 至 2,147,483,647 的整数。超时抛出 `ZAIClientError`（`code: 'authentication'`，消息 `Token acquisition timed out.`），丢弃迟到结果并允许后续调用重新获取。它只限制 Token 获取时间，不限制随后业务请求的时长；本地签发 ek 时读取密钥仍使用 `signingSecretTimeoutMs`。

`fetchToken` 和 `getSigningSecret` 收到的获取上下文被冻结，只含 `signal` 和 `reason`。首次获取的原因是 `'initial'`，成功获取后的下一次续期是 `'refresh'`，调用 `invalidate()` 后是 `'invalidated'`；失败或超时后的重试保留原原因。普通 ek 续期复用缓存密钥，不重新调用 `getSigningSecret`；初次获取或清除密钥缓存后才调用它。每个 provider 的身份和用途固定，业务请求的上下文及 signal 不会传入共享获取。

### 认证上下文

自定义客户端回调签名为 `getToken(context: ZAIAuthContext): string | Promise<string>`，返回不含 `Bearer` 的 Token。SDK 在每次发送请求前提供冻结的上下文：

| 字段 | 内容 |
| --- | --- |
| `purpose` | 本次选择的 `'admin'` 或 `'user'` |
| `baseUrl` | 规范化后的绝对 API 根地址 |
| `method` | 大写 HTTP 方法：`GET`、`POST`、`PUT`、`PATCH`、`DELETE` |
| `path` | 模板路由，例如 `/sessions/{session_id}/messages`，不含实际参数、查询、请求体或请求头 |
| `signal` | 可选，原业务请求的 `AbortSignal` |
| `identity` | 可选，冻结的 `{appID, userID}`；不含密钥或 `userName` |

自定义客户端可通过顶层 `identity` 绑定身份，创建时会校验并保存冻结快照；后续修改原对象不影响客户端。自动认证从 `auth` 取得身份，不能另传顶层 `identity`。这项身份声明不会解码或验证回调返回的 Token，调用者应确保凭据与绑定身份一致，切换用户时创建新实例。

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
  identity: {appID: credentials.appID, userID: credentials.userID},
  getToken: context => context.purpose === 'admin' ? getAdminToken() : getUserToken(),
});
```

共享接口默认选择 user，也可通过请求选项 `tokenType` 显式选择；固定权限接口拒绝冲突选项。选择在请求前完成，不会在 401/403 后重放。旧 `getToken(admin: boolean)` 签名已移除，必须改用 `context.purpose`；不要把上下文对象当布尔值判断。无参回调和固定类型 provider 可以直接传入，它们忽略上下文，不会自动切换令牌类型。自定义缓存应按身份和用途分别管理，不能共用一个未区分的缓存值。`auth.mode: 'auto'` 与 `getToken` 仍然互斥。

### 限制客户端用途

普通业务客户端可设置 `allowedTokenTypes: ['user']`，管理任务可设置 `['admin']`。省略时允许两种用途。此选项适用于自动认证和自定义 `getToken`；SDK 根据接口及请求选项选出令牌用途后，若用途不在允许列表中，会在调用 `getToken` 或发出任何认证、业务请求前抛出 `ZAIClientError`（`code: 'invalid-input'`）。

```ts
const userClient = createZAIClient({
  baseUrl,
  allowedTokenTypes: ['user'],
  auth: {mode: 'auto', ...credentials},
});
await userClient.agents.list(); // 默认 user，允许。
// userClient.settings.models.list({tokenType: 'admin'}) 会在本地拒绝。

const adminClient = createZAIClient({
  baseUrl,
  allowedTokenTypes: ['admin'],
  auth: {mode: 'auto', ...credentials},
});
await adminClient.settings.models.list({tokenType: 'admin'});
// 共享接口仍默认 user；省略 tokenType 会被此客户端拒绝，不会自动改用 admin。
```

`allowedTokenTypes` 接受非空的只读数组，成员只能为 `'admin'` 或 `'user'`，重复成员允许；SDK 在创建客户端时保存快照，后续修改原数组不会改变客户端限制。

该限制约束业务请求选择的令牌用途，不解码或验证自定义回调返回的 Token，也不代替服务端权限检查。`['user']` 的自动认证客户端仍持有应用 API Key，并可在内部使用 ak 获取 signing secret。希望运行进程无需持有应用 API Key 时，使用直接密钥 provider，并通过 `getToken` 接入。

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

模型管理的数字 `id` 标识记录，调用模型使用 `model_id`。新版不提供旧顶层 `executor/workspaces/repositories/models`。仓库文件下载使用 `coding.repositories.downloadFile(agentId, workspaceId, repositoryId, {path})`，返回 `Blob`；支持 ak/ek，默认 ek，`path` 相对仓库根目录，缺失或为空返回 404。仓库响应的必填 `relative_path` 相对工作区根目录，当前为 `repo_key`，在物化前也可用。列表仅请求一页，保留相应接口原始返回结构，不再归一化旧模型数组。

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

Coding turn 启动及仓库更新返回 HTTP 202，只表示接受请求。`coding.events.stream()` 已纳入正式 OpenAPI：保留 `id/event/rawData` 及完整事件对象，忽略约每 20 秒一次的心跳；连接约 60 秒关闭。合法 `error` 事件仍需继续读取后续 `turn.failed`；turn 完成、失败或取消仍是数据事件，不结束流；不要求 `[DONE]`，EOF 只表示连接结束。调用者保存处理完的事件游标，通过 `after_seq` 或 `options.headers` 中的 `Last-Event-ID` 手动恢复，并按 seq 去重。[Coding 事件协议](https://zai-dev.sh.oop.cc/docs/zai/coding/events)

`coding.interactions.resolve()` 成功只表示决策已接收并排队。实际计划模式以 `session.updated` 的 `payload.plan_mode` 为准，最终完成等待对应 Turn 的 `turn.completed`。创建会话时 `system_prompt` 的规范已移除 16,000 字符限制；这不表示模型上下文或服务资源没有上限。

```ts
const idempotencyKey = crypto.randomUUID(); // 保存到业务请求，重试创建会话时复用。
const codingSession = await client.coding.sessions.create('runner-agent-id', {
  workspace_id: 'workspace-id',
}, {idempotencyKey});
const status = await client.coding.agents.getStatus('runner-agent-id', {session_id: codingSession.id});
if (status.status !== 'ready') throw new Error('Runner 尚未就绪');
const turn = await client.coding.turns.start(codingSession.id, {content: '分析测试失败原因'});
const signal = AbortSignal.timeout(300_000); // 整个观察过程共用截止时间。
let afterSeq = 0;
let terminal = false;
while (!terminal) {
  signal.throwIfAborted();
  const events = await client.coding.events.stream(codingSession.id, {after_seq: String(afterSeq)}, {signal});
  for await (const event of events) {
    if (event.data.seq <= afterSeq) continue;
    console.log(event.id, event.event, event.data);
    afterSeq = event.data.seq; // 空文本事件也推进游标，只拼接 message.delta。
    if (event.data.turn_id === turn.id && ['turn.completed', 'turn.failed', 'turn.canceled'].includes(event.data.type)) {
      terminal = true;
      break;
    }
  }
  if (!terminal) await new Promise(resolve => setTimeout(resolve, 1000));
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

原始 [`zai-openapi.json`](./zai-openapi.json) 和只增补缺失路径的 [`zai-openapi.supplement.json`](./zai-openapi.supplement.json) 随安装包提供，分别通过 `zai-sdk/openapi.json`、`zai-sdk/openapi-supplement.json` 导出。Coding SSE 已进入原始规范，当前 supplement 的 `paths` 为空；导出保留，重复路径仍会使生成失败。

## 开发与验证

开发环境、构建测试、接口生成与提交约定统一维护在源码仓库的 [AGENTS.md](https://github.com/easysoft/zai-sdk/blob/main/AGENTS.md)。其中也提供文档维护、验证记录和真实服务测试的入口。

本版交付本地 SDK、文档和验证，不包含 npm 发布或消费项目迁移。
