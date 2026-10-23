# 从 0.2.x 升级到 0.3.0

0.3.0 直接适配新版契约，包含破坏性变化，不提供旧服务兼容层。API 根地址保持 `/v1/zai`。当前原始规范（含 Coding SSE）覆盖 **100 条路径、153 个 HTTP 操作、55 个公共 Schema、156 个资源方法**。

## 2026-10-22 契约增量

- 新增 `coding.repositories.downloadFile(agentId, workspaceId, repositoryId, {path})`，返回 `Blob`，允许 ak/ek、默认 ek。`path` 相对仓库根目录，规范中可省略，但缺失或为空时服务返回 404；Runner 离线返回 503。会话附件的 `coding.sessions.downloadFile` 仍仅允许 ek，且保留 `file_id/path` 恰好一个的约束。
- 仓库列表、创建、详情和更新响应新增必填 `relative_path: string`。它相对工作区根目录，当前为 `repo_key`，在物化前也可用。构造这些响应类型的 mock、测试夹具或手写对象需要补齐字段；旧服务可能缺少此字段。
- `coding.events.stream` 已进入原始规范，公开方法与事件类型不变。删除 supplement 中的重复路径，保留空 `paths`、包导出和重复路径报错规则。使用方不要再假设 supplement 必定包含一个接口。
- SSE 约每 20 秒发送心跳，连接约 60 秒关闭。用处理完的 seq 通过 `after_seq` 或 `options.headers: {'Last-Event-ID': '...'}` 续接，并按 seq 去重；EOF 不能作为任务成功或取消任务的依据。示例在同一个截止时间内续接，SDK 本身仍不自动重连。
- 审批 `resolve` 成功表示决策已接收并排队；从 `session.updated.payload` 的 `turn_id/plan_mode` 获取实际模式变化，等待对应 Turn 的 `turn.completed` 确认完成。
- 创建 Coding 会话的 `system_prompt` 已移除规范中的 `maxLength: 16000`；SDK 原本没有本地长度截断，不据此保证模型上下文或实际服务容量无限制。

## Runner 与 Coding 会话

先在应用控制台保存 Coding 环境，再通过 `coding.agents.create({name})` 使用 ak 创建 Agent；无需指定 `runner_profile_id`。随后以 ek 确保 SSH 密钥、配置 Git 身份、创建工作区和会话，查询状态就绪后启动 Turn。`coding.runners` 的 Profile 写接口保留供旧客户端兼容；新应用不再以创建 Profile 作为入门步骤。

| 0.2.x | 0.3.0 |
| --- | --- |
| 在线 Runner 列表 | `coding.runners` 管理应用 Profile，`coding.runners.instances` 管理用户实例 |
| Agent 的 `runner_id` | `runner_profile_id`；专用管理入口为 `coding.agents` |
| 创建 Coding 会话时覆盖 `provider/runner_id` | 删除覆盖；由应用配置决定 provider，响应保留 Profile、Instance 和版本信息 |
| 固定会话执行方式 | 可指定 `mode/plan_mode/system_prompt/primary_repo_key`，并支持标题生成 |
| Coding 模型列表无 Agent | `coding.models.list({agent_id})`，新增 `coding.modes.list` |
| 无参数轮换 SSH 密钥 | `coding.keys.rotate(agentId, {fingerprint})`，先读取当前密钥指纹 |
| 仓库更新成功即完成 | HTTP 202 表示已接受，按实际状态确认就绪 |

`coding.agents.getStatus/streamStatus` 默认 ek 查询当前用户；显式 `{tokenType: 'admin'}` 必须提供 `external_user_id`。用户令牌不得覆盖用户范围。`ensureRunnerInstance` 仅允许 ek，202 不代表实例已经就绪。

## 请求选项、权限与错误

方法最后的 `ZAIRequestOptions` 新增 `idempotencyKey?: string` 和 `tokenType?: 'admin' | 'user'`。共享权限接口允许显式选择，固定权限接口拒绝冲突选项。`getToken(admin: boolean)` 签名不变，布尔值表示这次选择 ak 还是 ek；自定义回调应分别管理两类令牌。

`settings.models.list()` 改为默认 ek，返回应用可用目录。查询自有管理目录使用 `settings.models.list({tokenType: 'admin'})`；其他模型管理与测试仍需要 ak。通用 `agents` 保持默认选择，管理 runner 推荐使用 `coding.agents`，通过通用入口管理时显式选择 admin。

Git identity、SSH keys、Coding 原件下载与客户端工具结果回填只允许 ek。Profile/Instance 管理、Coding Agent 管理（含列表和详情）、记忆重建和模型测试使用 ak。

11 个写操作要求幂等键。SDK 优先使用 `options.idempotencyKey`，其次使用合并后的 `Idempotency-Key` 请求头，均未提供时通过 Web Crypto 自动生成。显式键必须非空且为 1–128 字符；**业务重试必须复用原键**，每次独立方法调用都会生成新键。SDK 不增加自动重试或轮询。

```ts
const idempotencyKey = crypto.randomUUID(); // 与业务请求一起保存。
await client.coding.sessions.create(agentId, {workspace_id: workspaceId}, {idempotencyKey});
// 不确定上次响应时，在确认业务重试条件后复用同一个 idempotencyKey。
```

新增 `ZAIErrorInfo` 与 `ZAIClientError.errorInfo`，结构有效时提取服务端 `error_info` 中的 `code/message/reason_code/user_message/details` 和可选 `retryable`。SDK 原有错误分类 `code`、消息与完整 `body` 保持不变；畸形或缺失的诊断信息不会被当作有效 `errorInfo`。

## 文件、附件与客户端工具

普通 `sessions.uploadFile` 的 `path` 改为可选。省略它会上传不可变附件并返回文件 ID，提供非空 path 则保留旧工作区上传方式。普通消息的 `input_image/input_file` 至少提供 `file_id/path` 之一，也可同时提供；上传响应的 id 为可选字段，应在使用前检查。

```ts
const uploaded = await client.coding.sessions.uploadFile(sessionId, {name: 'report.txt'}, new Blob(['报告正文']));
await client.coding.turns.start(sessionId, {content: '总结附件', attachment_ids: [uploaded.id]});
const original = await client.coding.sessions.downloadFile(sessionId, {file_id: uploaded.id});
```

Coding 上传发送原始 `Blob`，不是 multipart；input 按规范可省略，允许零字节。原件下载只接受 ek；下载和创建单次下载链接的 `file_id/path` 必须恰好提供一个。单次链接最多有效十分钟且仅能使用一次，不适合持久化到消息中；使用附件引用和 `asset_delivery` 处理消息中的文件交付。

`coding.toolCalls.resolve(sessionId, toolCallId, input)` 仅允许用户回填结果，input 必填且为 `{output: unknown; error?: never} | {error: {code: string; message: string}; output?: never}`。`output: null` 合法；SDK 只序列化一次，校验实际发送内容，空对象、双选或序列化后 output 丢失会在获取令牌前报错。

## 三种 SSE 与诊断

- 普通消息 SSE 仍要求 `[DONE]`，错误事件保持抛错行为。
- Coding 会话 SSE 中合法 `error` 是数据事件，后续仍会收到 `turn.failed`；完成、失败或取消都不关闭会话流。只拼接 `message.delta`，空文本事件也推进 seq 游标；非信封通道错误和畸形事件仍抛错，EOF 只表示连接结束。
- 新 `coding.agents.streamStatus` 返回 `ZAIRunnerStatusStreamEvent`，保留 `event/id/rawData`，`data` 是 unknown，正常 EOF 结束，不要求 `[DONE]`。

三种流均支持取消、提前退出和资源清理，不自动重连。模型测试、标题生成和记忆重建可能消耗额度，保持显式调用；`doctor()` 默认不接入这些操作。新增记忆同步状态、失败内容查询和重建入口便于跟踪处理结果。

字段及路径以本地原始 OpenAPI 为准；权限和协议补充依据 [Coding API](https://zai-dev.sh.oop.cc/docs/zai/coding/api)、[快速开始](https://zai-dev.sh.oop.cc/docs/zai/coding/getting-started) 和 [事件流说明](https://zai-dev.sh.oop.cc/docs/zai/coding/events)。supplement 只允许增补原始规范缺失的路径，当前为空；离线测试不等于真实服务权限与运行流程验收。

---

以下保留 0.1.x → 0.2.0 的历史迁移记录；涉及模型目录、Runner 与文件上传的最新行为以上方 0.3.0 说明为准。

# 从 0.1.x 升级到 0.2.0

0.2.0 是破坏性升级。将 API 根地址 `/v8` 改为 `/v1/zai`，按以下映射迁移调用及类型；旧资源不提供兼容别名。

## 公开 API 变化

| 原入口或行为 | 0.2.0 |
| --- | --- |
| `workspaces.*` | `coding.workspaces.*`，更新请求改为 PUT |
| `repositories.*` | `coding.repositories.*`，更新请求改为 PUT |
| `executor.getPublicKey/rotatePublicKey` | `coding.keys.getPublic/rotate` |
| `executor.getAgentsMarkdown/updateAgentsMarkdown` | `coding.workspaces.getAgentsMarkdown/updateAgentsMarkdown` |
| `repositories.downloadFile` | 删除，规范没有替代下载接口 |
| `models.*` | `settings.models.*` 是管理员配置能力，不再是可用/历史模型目录 |
| `models.list({all: ...})` 与数组归一化 | 删除，直接使用管理接口的正式返回结构 |
| 实体 `integration_id` | `app_id` |
| Agent `type: 'executor'` | `type: 'runner'`，新增 `runner_id` |
| 普通会话 `executor_provider` | 删除；编码会话使用 `coding.sessions.create(..., {workspace_id, provider})` |
| 会话文件列表 `path` 查询 | 删除 |
| 仓库文件列表、内容 | 列表返回 `{entries}`；内容支持 base64，检查 encoding 与 truncated |

`agents/sessions/messages/skills/agentSkills/memories` 保留，输入与返回按新规范重新生成。记忆内容类型收窄为 `text/markdown`，任务状态、搜索结果及高级过滤使用新版结构。

新增 `chat.conversations/chat.messages/chat.send/stream`、`qa`、`files.extract`、`memories.filterContents`，以及 Coding 的 sessions、turns、events、interactions、git、models、runners。编码会话归档是 `coding.sessions.archive()`。

类型使用完整方法路径的 PascalCase，例如 `CodingSessionsCreateInput`、`ChatMessagesSendResponse`。路径参数仍按 URL 顺序传字符串，最后可传 `{signal, headers}`。模型管理响应的 `id` 是数字记录 ID，实际调用模型使用 `model_id`。

## 鉴权迁移

```ts
const client = createZAIClient({
  baseUrl: 'https://zai.example.com/v1/zai',
  auth: {mode: 'auto', appID, appKey, userID},
});
```

`auth` 与 `getToken` 互斥。默认选择：20 个管理员操作使用 ak，其余 100 个允许 ak/ek 的操作使用 ek。没有仅允许 ek 的操作。权限按 HTTP 方法和路径显式配置，详情、来源和实际选择展示在 HTML 的每个接口下。

仅允许 ak 的操作（省略 `/v1/zai` 前缀）：

| 操作 | 数量 |
| --- | ---: |
| `GET/POST /models`，`GET/PATCH/DELETE /models/{id}` | 5 |
| `GET /channels`，`PUT /channels/{id}` | 2 |
| `GET /signing_secret`，`POST /signing_secret/generate` | 2 |
| `POST /memories`，`PUT/DELETE /memories/{id}` | 3 |
| `POST /memories/{id}/contents`，`PUT/DELETE /memories/{id}/contents/{content_id}`，`POST /memories/{id}/contents/batch` | 4 |
| `GET /memories/{id}/contents/{content_id}/chunks`，`GET /memories/{id}/contents/{content_id}/jobs`，`GET /memories/queue/stats` | 3 |
| `GET /coding/runners` | 1 |

ak 继续用应用 API Key 本地签发；同步方法保留 `createZAIToken(appID, appKey, userID, expiredTime?, userName?)`。编码统一为 UTF-8 JSON/Base64，解除旧 Latin-1 限制；hash 使用小写 MD5，时间仍为 Unix 秒。可选昵称不参与 hash。

`createZAITokenProvider({credentials})` 仍默认管理员令牌。要取得 ek，使用 `{credentials, tokenType:'user', baseUrl}`：SDK 先签 ak 读取 `/signing_secret`，校验响应后本地签 ek。`fetchToken` 模式保持不变，浏览器应从业务后端获取 ek。

自定义客户端回调从无参扩展为 `getToken(admin: boolean): string | Promise<string>`。每次发送请求前，管理员专属接口传 `true`，共享接口传 `false`；分别返回 ak 和 ek（共享接口也允许 ak）。回调只有这个布尔参数，不接收其他接口信息，SDK 不解码返回令牌。这不是在 403 后升级令牌重试。

```ts
const getAdminToken = createZAITokenProvider({credentials});
const getUserToken = createZAITokenProvider({credentials, tokenType: 'user', baseUrl});
const client = createZAIClient({
  baseUrl,
  getToken: admin => admin ? getAdminToken() : getUserToken(),
});
```

无参回调和固定类型 provider 仍可直接传入，但它们忽略 `admin`，不会自动切换令牌类型。需要两种令牌时按上例分开缓存和续期，或使用互斥的 `auth.mode: 'auto'`；不要把 ak 和 ek 存在同一个未区分类型的缓存值中。

Token 默认 1000 秒有效、提前 60 秒续期。signing secret 在当前实例缓存，并发共享首次获取，普通 ek 续期不发请求。密钥获取独立超时默认 30 秒，可设 `signingSecretTimeoutMs`；取消一个业务请求不取消共享获取，失败后可重试。

SDK 不自动轮换密钥，也不在 401/403 后升级令牌或重放请求。切换用户或轮换 signing secret 后必须重建 provider/client；已有 SSE 不自动重连。

## 会话、上传与诊断

普通 `messages` 保留 content 数组。Chat 使用文本 content 和 attachments，返回结构与普通消息不同。需要持续对话时显式创建 Chat 会话并保存 ID；便捷发送的 JSON 响应不承诺返回新会话 ID。

三个消息发送端点都通过 `send/stream` 固定返回模式，输入不接受 `stream`。消息 SSE 使用 `[DONE]` 完成；Coding SSE 是独立持续流，不要求 `[DONE]`，turn 终态仍是数据事件，EOF 不代表任务成功。调用者保存游标，通过 `after_seq` 手动恢复。Coding turn 返回 HTTP 202 表示接受；QA upsert 支持 200 和 201 两种成功状态。

文件提取只需要 file；会话上传仍需要 path 和 file；技能支持 JSON 或 ZIP。二进制字段在公开类型中映射为 `ZAIUploadFile`，保留原 Schema 的可选性。

`doctor()` 不再查询管理员模型目录，默认检查类型不再包含 chatModels。Agent 列表接受 runner；聊天探针仍选择活跃 custom Agent。`model` 只交给显式开启的聊天探针验证，失败和取消后的独立清理保留。

## 规范来源与已知缺口

原始规范有 77 条路径、119 个操作、47 个公共 Schema。独立 Coding SSE 补充使覆盖达到 78 条路径、120 个操作、123 个资源方法。包分别导出 `openapi.json` 和 `openapi-supplement.json`；重复路径使生成失败，不静默覆盖。

类型以正式 Schema 为准，以下矛盾只记录，不推测性修改：

- Memories、QA、文件提取的部分描述写“必填”，但缺少 `required`；示例提供业务需要的字段，生成类型保留正式可选性。
- `SettingsModel.model_type` 同时声明 nullable 类型和不含 null 的 enum。
- 单条 ChatMessage 的 `allOf` 不能表达文档预期的 nullable。
- Chat 工具默认执行模式的描述不一致；示例显式指定 `tool_execution_mode`。
- Conversation settings 描述支持默认值合并，但引用类型要求完整字段；传入时提供完整对象，或者省略 settings。

权限要求来自当前规范和[应用鉴权文档](https://zai-zjy.sh.oop.cc/docs/authentication/app-api)。补充 SSE 来自 [Coding 事件文档](https://zai-zjy.sh.oop.cc/docs/zai/coding/events)。离线检查验证 SDK 契约与令牌选择，真实应用、用户归属及服务端权限需在指定测试环境另行验收。
