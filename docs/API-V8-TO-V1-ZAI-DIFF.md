# `/v8` 与 `/v1/zai` 接口差异对照

整理日期：2026-09-29。

本文比较 API 契约及相应 SDK 调用变化。新版包含路径迁移、数据结构调整、权限要求明确化和新增业务能力，不能只替换 URL 前缀。

## 1. 对比依据与统计口径

- 旧版：提交 `c418062dd88823f24e2b5f09a793f898759a2516` 中的 `zai-openapi.json`，可用 `git show c418062:zai-openapi.json` 查看。
- 新版：项目当前 [zai-openapi.json](../zai-openapi.json)。
- Coding SSE：单独来自 [zai-openapi.supplement.json](../zai-openapi.supplement.json)，依据[官方事件流文档](https://zai-zjy.sh.oop.cc/docs/zai/coding/events)，不计入原始新版规范的 119 个操作。
- 令牌要求：结合新版规范、[应用鉴权文档](https://zai-zjy.sh.oop.cc/docs/authentication/app-api)以及项目中逐操作的权限映射。

| 项目 | `/v8` | `/v1/zai` 原始规范 | 新版 SDK 合并契约 |
| --- | ---: | ---: | ---: |
| 路径数 | 43 | 77 | 78 |
| HTTP 操作数 | 71 | 119 | 120 |
| `components.schemas` 数量 | 0，使用内联 Schema | 47 | 47 |
| SDK 资源方法数 | 72，含普通消息 stream | — | 123，含三组消息 send/stream 和独立 Coding SSE |

两份原始规范的 `info.version` 都是 `1.0.0`，不能用这个字段判断兼容性。SDK 的 `0.1.x → 0.2.0` 是另一套版本号。

以下路径均省略对应的 `/v8` 或 `/v1/zai` 根前缀。按去掉根前缀后的 `HTTP 方法 + path` 比较：

- 54 个操作保留相同键，其中 `GET /models` 的含义被替换，其余 53 个保留并演进。
- 16 个旧操作迁入 Coding，其中两个更新操作同时从 PATCH 改为 PUT。
- 1 个旧操作移除：仓库文件下载。
- 49 个全新操作加入原始规范。
- 另补充 1 个 Coding SSE 操作。

因此，原始新版为 `53 + 1 + 16 + 49 = 119` 个操作；不能把迁移后的 16 个操作再当作全新能力统计。

## 2. 主要变化概览

| 方面 | 旧版 | 新版 | 调用方需要处理 |
| --- | --- | --- | --- |
| 根地址 | `/v8` | `/v1/zai` | 更新 API 根地址 |
| 应用归属字段 | 多个实体使用 `integration_id` | 相应实体改为 `app_id` | 更新字段读取、持久化映射和类型 |
| Agent 执行类型 | `executor` | `runner` | 更新枚举和创建/更新参数 |
| 工作区、仓库、公钥 | 普通 Agent 下的工作区及 executor 路径 | 统一归入 `/coding` | 更新路径、部分方法及响应解析 |
| 会话模型 | 普通 sessions 同时带执行器相关配置 | 普通 sessions、Chat conversations、Coding sessions 分开 | 按业务选用会话类型，不复用错误的数据结构 |
| `GET /models` | 当前用户可用/历史模型目录 | 应用拥有的模型管理目录，仅 ak | 不能继续用它判断普通用户能调用哪些模型 |
| 权限 | 全局 Bearer 声明支持 ak/ek，逐项约束不足 | 本版明确 20 个 ak 专属操作，其余共享 | 为每个操作选择合适令牌 |
| 类型定义 | 大量内联 Schema | 引入 47 个共享 Schema 和本地 `$ref` | 解析引用，保留规范中的 required/nullable |

## 3. 路径迁移、HTTP 方法变化与删除

### 3.1 迁入 Coding 的 16 个操作

| 旧方法与路径 | 新方法与路径 | 数量 |
| --- | --- | ---: |
| `GET/POST /agents/{agent_id}/workspaces` | `GET/POST /coding/agents/{agent_id}/workspaces` | 2 |
| `GET/DELETE /agents/{agent_id}/workspaces/{workspace_id}` | `GET/DELETE /coding/agents/{agent_id}/workspaces/{workspace_id}` | 2 |
| `PATCH /agents/{agent_id}/workspaces/{workspace_id}` | `PUT /coding/agents/{agent_id}/workspaces/{workspace_id}` | 1 |
| `GET/PUT /agents/{agent_id}/workspaces/{workspace_id}/executor/AGENTS.md` | `GET/PUT /coding/agents/{agent_id}/workspaces/{workspace_id}/AGENTS.md` | 2 |
| `GET /agents/{agent_id}/executor/public-key` | `GET /coding/agents/{agent_id}/keys/public` | 1 |
| `POST /agents/{agent_id}/executor/rotate` | `POST /coding/agents/{agent_id}/keys/rotate` | 1 |
| `GET/POST /agents/{agent_id}/workspaces/{workspace_id}/repos` | `GET/POST /coding/agents/{agent_id}/workspaces/{workspace_id}/repos` | 2 |
| `GET/DELETE /agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}` | `GET/DELETE /coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}` | 2 |
| `PATCH /agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}` | `PUT /coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}` | 1 |
| `GET /agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files` | `GET /coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files` | 1 |
| `GET /agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/content` | `GET /coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/content` | 1 |

公钥能力从 `executor/public-key`、`executor/rotate` 改为 `keys/public`、`keys/rotate`；工作区的 `AGENTS.md` 路径去掉 `executor` 层级。

### 3.2 被移除的操作

旧 `GET /agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/download` 在新版规范中没有对应下载接口，SDK 删除 `repositories.downloadFile()`。

普通会话的 `GET /sessions/{session_id}/files/download` 仍然存在。仓库读取接口新增 base64 能力，但它返回 JSON 内容，并不等价于原先的二进制下载响应。

### 3.3 路径保留的资源

普通 `agents`、`sessions`、`messages`、`skills`、`agentSkills`、`memories` 的原有相应路径保留，统一更换根前缀。路径保留不意味着字段、权限或响应含义完全兼容，具体见后文。

## 4. 已有资源的参数与响应差异

### 4.1 Agent、普通会话、普通消息与技能

| 对象或操作 | 旧版 | 新版 |
| --- | --- | --- |
| Agent、普通 Session、Message、技能挂载等实体归属 | `integration_id` | `app_id`，相应 required 同步调整 |
| Agent `type` | `custom / executor / system` | `custom / runner / system` |
| Agent 创建、更新 | 无 `runner_id` | 增加 `runner_id` |
| 普通 Session 创建、更新及返回 | 包含 `executor_provider`，值为 `claude/codex/opencode` | 移除此字段；编码 provider 在 Coding Session 中配置 |
| 消息 `execution_summary.runtime` | `executor / pi_coding_agent` | `runner / pi_coding_agent` |
| `GET /sessions/{session_id}/files` | 支持可选 `path` 查询 | 移除该查询参数 |

普通会话仍使用 `POST /agents/{agent_id}/sessions`，普通消息仍使用 `POST /sessions/{session_id}/messages`。新 Chat 接口是另一组能力，不是把这些旧接口直接改名。

普通消息发送请求的正式结构没有实质变化，仍支持 content 数组；技能 JSON 文件列表、ZIP 包、版本发布及 Agent 挂载能力保留。Skill 本体和技能挂载中的应用归属字段均需随实体迁移，不能只调整顶层 Agent。

### 4.2 Coding 工作区与仓库

| 对象或操作 | 差异 |
| --- | --- |
| 创建工作区 | 增加 `is_default`；内嵌 repositories 增加 `name/is_default`，`repo_key/url` 不再列入 required，`default_branch` 不再声明默认 main |
| 更新工作区 | PATCH 改为 PUT；创建、更新的 name 均去掉 `minLength:1` 约束 |
| 工作区对象 | `status` 从 active/deleted 枚举变为普通字符串；`custom_data` 不再列为必填；`description` 从可选变为必填，仍允许 null |
| 删除工作区 | 返回从 `{deleted: boolean}` 改为工作区对象，不能再读取 `result.deleted` 判断结果 |
| 创建仓库 | 增加 `repo_key/is_default`，`url` 允许 null；移除旧 `initialize_git/initial_commit/template/metadata/set_as_default` 请求字段 |
| 更新仓库 | PATCH 改为 PUT；旧版只有 custom_data，新版增加 `name/description/default_branch/is_default` 更新字段 |
| 仓库实体 | 增加必填 `workspace_id`（可为 null）和可选 `url`（可为 null）；`description` 改为必填、仍允许 null；移除旧应用/用户、Git 初始化及目录等元数据字段；`status/source_type` 不再使用旧枚举限制 |
| 仓库文件列表 | 新增可选 `path` 查询；响应从 `{repository, root}` 改为 `{entries}`，不再是旧根节点树结构 |
| 仓库文件内容 | `encoding` 从仅 `utf-8` 扩展为 `utf-8/base64`；新增 `truncated`；移除 `name/mime_type/updated_at` 字段 |

仓库实体中移除的旧字段包括 `integration_id`、`agent_id`、`external_user_id`、`relative_path`、`git_initialized`、`initial_commit_sha`、`metadata`、`custom_data`、`last_used_at`。这些字段不能一概按 `integration_id → app_id` 机械替换：新版仓库实体并未为它们逐项提供对应字段。创建、更新请求仍接收 custom_data，只是新版响应不再声明它，不能描述为完全取消支持。

仓库内容读取时需要检查 `encoding` 再解码，同时考虑 `truncated`，不能默认 content 始终是完整 UTF-8 文本。

### 4.3 模型目录的语义替换

| 项目 | 旧 `GET /models` | 新 `GET /models` |
| --- | --- | --- |
| 作用 | 用户当前可用模型；可包含历史使用模型 | 当前应用拥有的模型管理记录 |
| 查询 | 可传 `all=true` 或 `all=1` | 无 `all` 参数 |
| 权限 | 旧规范未逐项明确管理员专属 | 仅 ak |
| `models[].id` | 字符串模型标识 | 数字数据库记录 ID |
| 模型调用标识 | `id` | 独立的 `model_id` 字符串 |
| 其他字段 | `object/created/owned_by/status` | `name/model_type/created_at` |
| SDK 入口 | `models.list()` | `settings.models.list()` |

新版应用拥有某条模型记录，不等于其所有用户都能调用该模型；规范说明用户调用能力仍由 abilities 决定。新增 `GET /coding/models` 用于 Runner/provider 的 Coding 模型，查询必须指定 provider，可选 agent_id/runner_id/refresh；不能当作旧普通聊天模型目录的通用替代。

旧 SDK 对模型列表的额外数组兼容/归一化也已删除；这是 SDK 行为变化。两版 OpenAPI 的模型列表正常成功响应均以对象包裹 `models` 数组。

### 4.4 记忆集合、内容与检索

新版将记忆相关内联结构整理为共享 Schema，同时调整内容、索引任务及检索结果。关键字段差异见下列条目；required 的减少只表示规范声明变化，不保证服务端接受缺少业务字段的请求。

| 对象或操作 | 旧版 | 新版 |
| --- | --- | --- |
| Collection / Content 归属 | 必填 integration_id | 必填 app_id；增加可选 external_user_id/external_username |
| Collection / Content 创建时间 | created_at 可选 | created_at 必填 |
| Collection 的 description/embedding_model/updated_at | 可选字符串或 null | 可选字符串，Schema 不再允许 null |
| Content 的 updated_at | 可选字符串或 null | 仍允许 null，仅 Schema 表达方式调整 |
| Content 的 content_type | text/markdown/document/web_page | 收窄为 text/markdown，影响写入、批量项及返回 |
| 内容列表的 type 查询 | 枚举 | 放宽为普通字符串；不要与 content_type 请求体枚举混淆 |
| 创建 Collection 的 max_tokens_per_chunk/overlap_tokens | integer | number 或 string |
| 两个向量检索请求的 limit/min_similarity | limit 为 integer；min_similarity 为 number | 均允许 number 或 string |
| Chunk 检索结果 | id/content/payload | collection_id/content_id/content_type/content_key/content_attrs/chunk_id/chunk_index/chunk_content/similarity，全部列为必填，content_key 可为 null |
| Content 检索结果 | 无 similarity 字段声明 | 增加可选 similarity |
| 批量创建结果 | 任意对象 | 明确为必填 success/message/content_ids |
| Embedding 队列统计 | 任意对象 | 明确为 queue/worker；queue 有状态计数、total 和按 memory/qa 分类的 byTarget；worker 有 isRunning/isStopping/pollIntervalMs |
| Embedding Jobs | 任意对象数组 | 明确为 EmbeddingJob 数组，包含目标、任务、状态、重试及时间字段 |

新版 EmbeddingJob 的必填字段为 `id/app_id/target_type/target_id/action/status/priority/retry_count/max_retries/payload/error_message/started_at/completed_at/created_at/updated_at`；其中 payload、error_message、started_at、completed_at、updated_at 允许 null。

正式 required 的主要变化：Collection 创建不再声明 name 必填，更新不再声明 name/status 必填；Content 创建和更新不再声明 content 必填；批量请求不再声明 contents 必填、数组项也不再声明 content 必填，并移除旧 1–500 项长度限制；向量搜索不再声明 query 必填。对应说明仍有“必填”或业务约束文字，调用方不能据此省略业务必需值。

新增高级过滤支持 attrs、content_type、content_keywords。attrs 的说明包含 `$gt/$gte/$lt/$lte/$ne/$in/$nin/$contains/$startsWith/$endsWith/$regex/$exists` 等操作符。

## 5. 原始规范新增的 49 个操作

### 5.1 Coding：19 个新增操作，另有前述 16 个迁移操作

| 方法与路径 | 能力 | 数量 |
| --- | --- | ---: |
| `GET /coding/runners` | Runner 运维列表，仅 ak | 1 |
| `POST /coding/agents/{agent_id}/sessions` | 创建编码会话 | 1 |
| `GET /coding/sessions` | 列出编码会话 | 1 |
| `GET/PUT/DELETE /coding/sessions/{session_id}` | 获取、更新、归档编码会话 | 3 |
| `GET /coding/sessions/{session_id}/tools` | 获取可用工具 | 1 |
| `POST /coding/sessions/{session_id}/turns` | 启动 turn，成功状态为 202 | 1 |
| `GET /coding/sessions/{session_id}/turns/{turn_id}` | 查询 turn | 1 |
| `POST /coding/sessions/{session_id}/turns/{turn_id}/cancel` | 取消 turn | 1 |
| `POST /coding/sessions/{session_id}/turns/{turn_id}/steer` | 追加引导 | 1 |
| `GET /coding/sessions/{session_id}/events` | 获取事件记录 | 1 |
| `GET /coding/sessions/{session_id}/interactions` | 列出交互请求 | 1 |
| `POST /coding/sessions/{session_id}/interactions/{interaction_id}/resolve` | 处理交互请求 | 1 |
| `GET /coding/sessions/{session_id}/diff` | 查看 Git 差异 | 1 |
| `POST /coding/sessions/{session_id}/commit` | 创建提交 | 1 |
| `POST /coding/sessions/{session_id}/push` | 推送 | 1 |
| `POST /coding/sessions/{session_id}/pull-request` | 创建 Pull Request | 1 |
| `GET /coding/models` | 获取 Coding 模型 | 1 |

创建 Coding Session 必须提供 workspace_id 和 provider，provider 为 claude/codex/opencode；runner_id 可选，model/title 可为 null。

独立补充的第 20 个新增 Coding 操作为 `GET /coding/sessions/{session_id}/stream`，支持 `after_seq` 恢复事件流。补充后 Coding 共 36 个 HTTP 操作。

### 5.2 Chat：12 个操作

| 方法与路径 | 能力 | 数量 |
| --- | --- | ---: |
| `GET/POST /chat/conversations` | 列表、创建会话 | 2 |
| `GET/PUT/DELETE /chat/conversations/{id}` | 获取、更新、删除会话 | 3 |
| `POST /chat/conversations/{id}/generate-title` | 生成标题 | 1 |
| `GET/POST/DELETE /chat/conversations/{id}/messages` | 消息列表、发送、清空 | 3 |
| `GET/DELETE /chat/conversations/{id}/messages/{message_id}` | 获取、删除消息 | 2 |
| `POST /chat/conversation` | 便捷发送，可指定 conversation_id | 1 |

### 5.3 QA：8 个操作

| 方法与路径 | 能力 | 数量 |
| --- | --- | ---: |
| `GET/POST /qa/pairs` | 问答列表、创建或 upsert | 2 |
| `GET/PUT/DELETE /qa/pairs/{id}` | 获取、更新、删除问答 | 3 |
| `POST /qa/batch/delete` | 批量删除 | 1 |
| `POST /qa/search` | 搜索 | 1 |
| `GET /qa/match` | 匹配 | 1 |

`POST /qa/pairs` 声明 200 和 201 两种成功响应，不能只按 201 判断成功。

### 5.4 应用管理：8 个新增操作，加上被替换语义的模型列表

| 方法与路径 | 能力 | 新增数量 |
| --- | --- | ---: |
| `POST /models` | 注册模型及专属兼容 OpenAI 的渠道 | 1 |
| `GET/PATCH/DELETE /models/{id}` | 详情、能力配置、解除应用所有权 | 3 |
| `GET /channels` | 查询渠道 | 1 |
| `PUT /channels/{id}` | 更新渠道 | 1 |
| `GET /signing_secret` | 获取当前应用 ek 签名密钥 | 1 |
| `POST /signing_secret/generate` | 重新生成签名密钥 | 1 |

上述操作以及 `GET /models` 均仅允许 ak。`POST /models` 成功返回 200，包含 `model/channel_id/created`；同一 `model_id` 的重放具有规范描述的幂等行为。`DELETE /models/{id}` 表示解除当前应用对模型的所有权，不应理解成删除所有应用共享的全局模型。

### 5.5 文件提取与记忆过滤：2 个操作

| 方法与路径 | 能力 |
| --- | --- |
| `POST /files/extract` | multipart 文件文本提取，仅文件，不使用会话上传的 path 字段 |
| `POST /memories/{id}/contents-filter` | 按内容属性等条件进行高级过滤 |

新增操作合计：`19 + 12 + 8 + 8 + 2 = 49`。Coding SSE 补充另计。

## 6. 鉴权差异与每类操作的令牌要求

两版 OpenAPI 的全局 `bearerAuth` 说明都提到 `ek-*` 或 `ak-*`。因此，不能把 ek 本身写成新版才引入的令牌，也不能根据旧规范未列出 403 就推断旧服务无需管理员权限。

新版依据当前规范与鉴权文档，可明确本次范围内：

| 要求 | 原始规范操作数 | 加入 Coding SSE 后 | SDK 自动模式 |
| --- | ---: | ---: | --- |
| 仅允许 ak | 20 | 20 | ak |
| 允许 ak 或 ek | 99 | 100 | ek |
| 仅允许 ek | 0 | 0 | — |

20 个 ak 专属操作如下；其余操作允许 ak 或 ek，但服务端仍会校验应用与用户归属。

| 范围 | 方法与路径 | 数量 |
| --- | --- | ---: |
| 模型 | `GET/POST /models`；`GET/PATCH/DELETE /models/{id}` | 5 |
| 渠道 | `GET /channels`；`PUT /channels/{id}` | 2 |
| 签名密钥 | `GET /signing_secret`；`POST /signing_secret/generate` | 2 |
| 记忆集合写入 | `POST /memories`；`PUT/DELETE /memories/{id}` | 3 |
| 记忆内容写入 | `POST /memories/{id}/contents`；`PUT/DELETE /memories/{id}/contents/{content_id}`；`POST /memories/{id}/contents/batch` | 4 |
| 记忆运维读取 | `GET /memories/{id}/contents/{content_id}/chunks`；`GET /memories/{id}/contents/{content_id}/jobs`；`GET /memories/queue/stats` | 3 |
| Runner 运维 | `GET /coding/runners` | 1 |

不能按“所有写操作用 ak”分类。例如普通消息、Chat、QA、Coding turn 和 Git 操作都属于共享令牌操作；反过来，部分 GET 操作仅允许 ak。Chat 创建返回 403 也可能表示记忆集合不属于当前应用，并不代表该接口只允许管理员令牌。

### SDK 签发能力的变化

| 能力 | 旧 SDK | 新 SDK 0.2.0 |
| --- | --- | --- |
| 客户端令牌来源 | 显式无参 `getToken` | `getToken(admin: boolean)` 在每次请求前收到权限标记；也可选择互斥的 `auth.mode: 'auto'` |
| 应用 Key 本地签发 | ak | ak 保留；ek 使用 signing secret 本地签发 |
| provider | credentials 默认签 ak，或 fetchToken | 默认仍签 ak；新增 `tokenType:'user'` 与 baseUrl |
| 首次获取 ek | SDK 无完整内置流程 | 先签 ak → GET signing_secret → 校验应用、密钥、前缀 → 签 ek |
| Base64 实现 | 旧实现直接对 JSON 调用 btoa，存在 Latin-1 限制 | UTF-8 JSON → Base64，支持中文和 emoji |
| 昵称 | 无 userName 参数 | 可选 userName 写入 user_name，不参与 hash |

Base64 一项描述的是 SDK 实现差异，不据此推断旧服务只接受 Latin-1。两种令牌均使用小写 MD5 和秒级过期时间，hash 输入为 `签名密钥 + appID + userID + expiredTime`：ak 的签名密钥是应用 API Key，ek 的签名密钥来自新接口。

`getToken(admin)` 的 `true` 表示该接口仅允许 ak，`false` 表示允许 ak 或 ek、推荐返回 ek。回调只接收这个布尔值，没有路径等其他接口参数；SDK 不解码返回的 Token。该标记在每次请求发送前传入，不是遇到 403 后升级权限重试。

无参回调和固定类型的 provider 保持兼容，但会忽略标记，不会自动切换令牌类型。需要同时使用两种令牌时，分别创建 ak/ek provider，使用 `getToken: admin => admin ? getAdminToken() : getUserToken()`，各自管理缓存和续期；也可交给 `auth.mode: 'auto'`。两种客户端配置仍互斥。

默认有效期仍为 1000 秒、提前 60 秒按需续期。ek 的 signing secret 仅在当前实例缓存，并发首次获取共享一个请求，后续续期本地完成；获取密钥默认独立超时 30 秒。SDK 不自动轮换密钥，不在 401/403 后改用 ak 重放。密钥轮换后需要重建 provider/client。

## 7. 普通消息、Chat 与 Coding 流的区别

| 项目 | 普通 messages | 新 Chat | 新 Coding |
| --- | --- | --- | --- |
| 会话入口 | `/agents/{agent_id}/sessions` | `/chat/conversations` | `/coding/agents/{agent_id}/sessions` |
| 发送入口 | `/sessions/{session_id}/messages` | `/chat/conversations/{id}/messages` 或 `/chat/conversation` | `/coding/sessions/{session_id}/turns` |
| 核心输入 | content 数组，或 messages 等普通消息输入 | 文本 content、attachments 等 | turn content 与 Coding 配置 |
| 非流式含义 | JSON 消息结果 | ChatMessageResult | HTTP 202 接受异步 turn |
| SSE 获取 | 消息 POST 的 stream 模式 | 两个发送 POST 的 stream 模式 | 独立 GET 会话事件流 |
| 完成标记 | `[DONE]` | `[DONE]` | 无 `[DONE]`；turn 终态仍是普通事件 |
| EOF | 缺少完成标记时 SDK 报错 | 同左 | 结束当前迭代，不表示 turn 成功 |
| 恢复 | SDK 不自动重连 | SDK 不自动重连 | 调用方保存游标并传 after_seq |

普通 `sessions.create()` 返回 `{session: ...}` 包裹结构；`chat.conversations.create()` 和 `coding.sessions.create()` 直接返回各自会话对象。三者不能复用相同的解包逻辑。

Chat 便捷发送虽可传 `conversation_id`，但其 JSON 响应没有声明新会话 ID。需要持续对话时先显式创建 Chat 会话并保存 ID。

Coding SSE 保留完整事件对象（`seq/type/turn_id/payload/created_at`）、SSE `id` 和事件名。心跳注释忽略；`turn.completed/failed/canceled` 不关闭持续会话流。错误、取消或提前退出会释放连接，SDK 不自动重连。

## 8. SDK 入口对照

| 旧入口 | 新入口或处理方式 |
| --- | --- |
| `workspaces.*` | `coding.workspaces.*` |
| `repositories.*` | `coding.repositories.*`，无 downloadFile |
| `executor.getPublicKey()` | `coding.keys.getPublic()` |
| `executor.rotatePublicKey()` | `coding.keys.rotate()` |
| `executor.getAgentsMarkdown()` | `coding.workspaces.getAgentsMarkdown()` |
| `executor.updateAgentsMarkdown()` | `coding.workspaces.updateAgentsMarkdown()` |
| `models.list()` | 管理用途改为 `settings.models.list()`；旧模型发现含义无同等替代 |
| `agents/sessions/messages/skills/agentSkills/memories` | 保留入口，使用新版字段和返回类型 |
| 无对应入口 | 新增 chat、qa、files.extract、settings、Coding 新能力 |

编码会话的 DELETE 在 SDK 命名为 `coding.sessions.archive()`。三个消息发送端点分别生成 `send()` 和 `stream()`，固定发送 `stream:false/true`，输入类型不允许调用方再指定 stream。

嵌套资源类型使用完整路径，例如 `CodingSessionsCreateInput`、`ChatMessagesSendResponse`。不保留旧顶层 `executor/workspaces/repositories/models` 别名，也不提供 `/v8` 兼容路由。

`doctor()` 不再查询管理员模型目录；默认以普通用户能力检查 Agent。它接受 runner 类型，但聊天探针仍选择活跃 custom Agent；model 仅传给显式开启的聊天探针。这是 SDK 诊断行为调整，不是一个新的服务端接口。

## 9. 成功状态、错误与上传处理

- Coding 启动 turn 的成功状态为 202；收到响应不代表任务完成，应继续消费事件或查询 turn。
- QA 创建/upsert 支持 200 和 201；模型注册返回 200，不能统一要求所有创建请求返回 201。
- 新规范为记忆和管理操作明确列出 401/403 等响应；公钥和仓库文件访问新增 Runner 不可用相关的 503。部分旧 400 声明被移除，这不证明真实服务绝不会返回 400。
- 会话文件上传仍为 `path + file`；文件提取使用 `file`；技能 ZIP 使用 `bundle` 及可选 changelog。三者的 multipart 字段不能混用，也不要手工覆盖 boundary。
- JSON 响应中的业务标志（如 ok、created、deleted）应依各接口含义处理，不能把所有 HTTP 2xx 强行解释成同一种业务结果。

## 10. 规范矛盾与解释边界

本版按照正式 Schema 生成类型，以下问题只记录，不擅自补全服务端契约：

1. Memories、QA、文件提取的部分描述写“必填”，但 Schema 未列入 required；实际调用仍应提供业务所需字段。
2. SettingsModel.model_type 的 type 允许 null，但 enum 仅含 chat/embeddings，声明存在冲突。
3. 单条 ChatMessage 响应中的 allOf 不能表达描述预期的 nullable。
4. Chat 工具默认执行模式的描述不一致；需要明确行为时显式传 tool_execution_mode。
5. Conversation settings 的描述支持默认值合并，但引用的 ConversationSettings 要求完整字段；当前类型按 Schema 要求处理。

内联结构改为 `$ref`、枚举顺序变化、重复 string 的 anyOf，以及等价的 nullable 写法，本身不列为行为变化。

上述权限结论属于规范与文档核对。SDK 离线测试已覆盖自动令牌选择，但没有完成全部操作的真实服务权限矩阵验收；应用、用户和工作区归属仍需在指定测试环境验证。

## 11. 迁移检查清单

- [ ] 更新根地址；检查是否仍硬编码旧 executor、workspace、repository 路径。
- [ ] 将工作区和仓库更新请求从 PATCH 改为 PUT。
- [ ] 按具体实体处理 integration_id/app_id，更新 executor/runner 及 execution_summary.runtime 枚举。
- [ ] 拆分普通会话与 Coding 会话，移除普通会话 executor_provider。
- [ ] 重写仓库文件列表、内容与工作区删除结果的解析，移除仓库下载调用。
- [ ] 区分模型记录 id 与调用 model_id，停止使用 all 查询和旧模型目录语义。
- [ ] 核对 20 个 ak 专属操作，并接入正确的 ek 签发流程或后端 Token provider。
- [ ] 分别处理三组消息 JSON/SSE 与持续 Coding SSE，保留游标和取消能力。
- [ ] 更新响应状态处理、multipart 字段以及正式 Schema 的必填/可空类型。
- [ ] 在指定测试应用中完成服务端权限及归属验收。

相关材料：[SDK 迁移说明](./MIGRATION.md)、[完整 API 与权限文档](./index.html)、[实施验证记录](./VALIDATION.md)。
