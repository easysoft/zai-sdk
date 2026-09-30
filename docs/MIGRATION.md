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
