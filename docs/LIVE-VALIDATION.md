# 仓库下载权限核对（2026-10-22）

通过已登录的文档页面核对 [Coding API](https://zai-dev.sh.oop.cc/docs/zai/coding/api#h-4aihmi) 的鉴权说明及仓库文件端点清单：`.../repos/{repository_id}/files/download` 使用共享 ak/ek 鉴权。文档对 `.../sessions/{session_id}/files/download` 另有仅 ek 的明确限制，SDK 分别映射为 `user` 和 `user-only`；共享接口默认选择 ek，允许显式选择 ak。

随后使用项目 `.env.local` 的测试凭据，对 `https://zai-dev.sh.oop.cc/v1/zai` 做 4 次只读请求：

| 检查 | 令牌 | HTTP 状态 |
| --- | --- | --- |
| 列出既有 Coding Agent | ak | 200 |
| 列出该 Agent 下当前用户的工作区 | ek | 200，空列表 |
| 仓库下载，使用不存在的工作区与仓库 ID | ak | 404 |
| 同一缺失资源的仓库下载 | ek | 404 |

两次下载探针的请求 ID 分别为 `03777641-3f26-4496-834c-18719e06911a` 和 `24c40665-262c-4d45-9cfc-c556c036ea01`。404 结果不能证明对真实仓库文件的读取权限；本次权限分类依据官方文档，没有把缺失资源探针标记为成功下载验收。测试用户没有现成工作区，因此未继续下载真实文件。

未创建或修改资源，未运行模型 Turn，也未执行完整 live 套件。上述状态与请求 ID 为本次脱敏记录；离线完整检查见 [VALIDATION.md](./VALIDATION.md)。

---

# ZAI SDK 0.3.0 真实环境验证（2026-10-16 历史记录）

验证日期：2026-10-16。使用项目 `.env.local` 的测试凭据，连接 `https://zai-dev.sh.oop.cc/v1/zai`；主流程与权限测试使用当前源码中的 SDK，最新镜像策略独立诊断使用原生 `fetch`。重点覆盖新版 Coding 主流程和 ak / ek 权限。日志只记录脱敏请求信息，不保存令牌、应用密钥、签名密钥、Git 身份、单次下载链接或模型响应正文。

## 最新诊断：2026-10-16 14:34–14:35 SGT

**镜像策略端点仍报告 Runner 部署配置未就绪，响应没有说明具体缺少哪项配置。** 14:34:27 SGT 使用原生 `fetch`，携带 ak、无请求体，直接请求 `GET https://zai-dev.sh.oop.cc/v1/zai/coding/runner-image-policies`，绕过 SDK 后仍收到 HTTP 503 `Service Unavailable`。响应类型为 `application/json`，`x-request-id` 为 `7c2d4c34-1ef9-46cf-85b1-843d2555fbd6`。

完整脱敏错误正文如下：

```json
{
  "error": {
    "code": "runner_deployment_not_configured",
    "message": "runner_deployment_not_configured"
  },
  "error_info": {
    "code": "runner_deployment_not_configured",
    "message": "The task could not be completed.",
    "reason_code": "runner_deployment_not_configured",
    "user_message": "runner_deployment_not_configured",
    "details": {
      "message": "runner_deployment_not_configured"
    }
  }
}
```

`details.message` 仅重复错误码，没有配置名称、缺失项或更深层原因；响应也没有 `retryable` 字段。14:35:07 SGT 使用同一个 ak 做只读对照：

| 请求 | HTTP 状态 | `x-request-id` |
| --- | --- | --- |
| `GET /coding/runners` | 200 | `45f10eaf-58a5-49ee-9f0c-ea55c86c7952` |
| `GET /coding/agents` | 200 | `791f00ae-36a3-4edc-937c-b6d97abd08e7` |
| `GET /coding/runner-image-policies` | 503 | `233bac91-972a-4ecf-9e88-15e9d896ea3d` |

对照确认同一个 ak 可访问另外两个 Coding 管理读取接口，镜像策略端点仍返回相同错误。[transport.ts](../src/transport.ts) 将服务响应的状态、正文和响应头传入错误对象，[errors.ts](../src/errors.ts) 保留 `body`、`headers` 并提取有效的 `error_info`，不会生成此 503 或改写 `details`。原生请求也复现了相同服务响应。

目前只能定位到镜像策略端点报告的部署配置检查失败，不能确定缺少哪个配置或配置是否已加载。下一步需要服务端按以上两个 503 请求 ID 查日志，并检查 `runner_deployment_not_configured` 的触发分支；客户端返回内容不足以推断具体配置项或环境变量名。

这 4 次诊断请求均只读，未创建或修改资源，没有新增清理任务，也未重跑 Turn；不计入此前 38 次复测请求。脱敏证据保存在 `test-results/live-0.3.0-image-policy-diagnostic.json`。

## 只读复测：2026-10-16 10:00 SGT

用户报告补齐配置后，使用更新的只读权限用例再次验证同一服务。记录时间为 `2026-10-16T02:00:51.459Z`（新加坡时间 10:00）。**镜像策略接口仍未恢复，Coding Agent 列表和详情的权限差异仍存在。** 1 项测试失败、退出码 1；没有执行新的 Turn。

| 检查 | 本次结果 |
| --- | --- |
| 镜像策略 | ak 仍返回 503 / `runner_deployment_not_configured`，ek 返回预期 403；未获得成功响应，无法验证 `policies` 数组及其 `id`、`runner_adapter` 字段 |
| Coding Agent 列表与详情 | ak / ek 均返回 200，与规范的管理员权限要求仍有两项差异；只读获取既有 active Agent，ak 详情的 ID、Profile 与列表一致 |
| 其他权限与令牌选择 | 原只读权限矩阵和 `getToken(admin)` 参数断言通过 |
| `doctor()` | 最新日志为 `all checks passed`，本次所有检查通过；上一轮缺少 active custom Chat Agent 的结果保留在下文 |
| 资源与用量 | 未创建或修改资源，未执行 Turn、未消耗模型用量，也没有新增清理任务 |

本次记录 **38 次请求、15 个不同 HTTP 操作**：200 × 32、403 × 5、503 × 1。结果只说明实际端点仍返回上述状态，不能据此确认配置是否已生效，或判断服务未恢复的具体原因。SDK 权限映射仍遵循本地规范。

10:01:57 SGT 另行采集一次镜像策略错误诊断，仍为 503，`code` 和 `reason_code` 均为 `runner_deployment_not_configured`。服务端请求 ID 为 `d045da0a-d078-4662-9e03-0d515a876187`，可用于日志定位。仅确认 `details` 含 `message` 键，未保存正文，响应没有 `retryable` 字段；这一次诊断请求不计入上述 38 次请求。

脚本新增了对既有 Coding Agent 详情的只读权限检查，以及镜像策略成功响应的结构断言；`pnpm typecheck`、该脚本的 ESLint 检查、`pnpm docs:build` 和 `pnpm docs:check` 通过。脱敏证据为 `test-results/live-0.3.0-config-retest.json` / `.log`。

本次未调用 `ensureRunnerInstance`，此前省略请求体返回 400 的差异没有复测；下文的实例准备、Turn 与清理结果均来自此前 Coding 主流程验收。

## 此前 Coding 主流程验收

**Coding 主流程已跑通，权限与服务契约验收尚未全部通过。** 一个最小 Turn 最终为 `completed`，临时资源已按服务 API 的删除、归档语义清理并复核。完整 Coding 轮次的两个聚焦测试仍以退出码 1 结束；修正测试中的诊断和清理判定后，上一轮只读权限复测仍复现 Coding Agent 列表权限差异与镜像策略接口 503。没有将这些结果标记为 `pnpm test:live` 全量通过。

## 主流程与权限结果

| 范围 | 实测结果 |
| --- | --- |
| Coding Agent | ak 仅提供名称即可创建，自动绑定已配置的 Profile；ak 读取成功。ek 列表和详情实际也返回 200，与当前规范的管理员权限声明不同 |
| Runner 实例 | ek 使用显式空对象调用 `ensureRunnerInstance`，两次相同幂等键均返回 202、同一个实例 ID；等待状态变为 `ready` 后继续 |
| Runner 状态 | ek 查询当前用户、ak 指定 `external_user_id` 的状态查询与状态流均返回 200；状态流收到 `runner.status` 快照后主动关闭。普通用户覆盖用户范围由 SDK 在请求前拒绝，此项属于客户端校验 |
| 工作区与会话 | ek 新建空工作区和会话；相同幂等键重放分别返回同一个 ID。工作区读取、更新、AGENTS.md 读写、空仓库列表、模型目录，以及会话详情、列表、工具与交互列表均通过 |
| 附件 | UTF-8 Blob 与零字节 Blob 原样上传和下载通过，工作区文件列表读取成功；原件下载 ek 返回 200、ak 返回 403。单次下载链接首次下载成功，同一链接第二次访问被拒绝；链接未写入消息 |
| Turn 与事件 | 使用 `attachment_ids` 引用附件，启动 Turn 返回 202，最终为 `completed` 并返回文本。Coding 会话收到 3 个 SSE 事件；只拼接 `message.delta`，持久化回放和 `after_seq` 游标续传通过，退出迭代后关闭连接 |
| 模型目录与回调 | `settings.models.list()` 默认 ek、显式 `tokenType: 'admin'` 使用 ak，均返回 200；`getToken(admin)` 的普通接口、默认模型目录、管理员模型目录、Runner 管理调用依次收到 `false / false / true / true` |
| SSH 与 Git 身份 | SSH 公钥读取 ak 返回 403，ek 返回 404，读取时未找到公钥；因为没有删除 API，本次跳过 `keys.ensure`，也未调用 `keys.rotate`。Git 身份读取 ek 返回 200、ak 返回 403，未修改已有身份 |
| `doctor()` | 配置、协议和服务连通性通过；总结果为 `pass: false`，原因是没有 active custom Chat Agent，与已通过的 Coding 主流程分别记录 |

真实请求使用固定 ak / ek provider 检查服务端权限；没有用 SDK 对冲突 `tokenType` 的本地拒绝代替服务端验证。具体读取矩阵如下：

- ak / ek 均为 200：`GET /agents`、`GET /sessions`、`GET /chat/conversations`、`GET /coding/sessions`、`GET /memories`、`GET /qa/pairs`、`GET /skills`、`GET /models`。
- ak 为 200、ek 为 403：`GET /channels`、`GET /signing_secret`、`GET /coding/runners`、`GET /memories/queue/stats`。Runner Profile 详情和实例列表、详情也验证了 ek 返回 403。
- `GET /coding/agents` 和 `GET /coding/agents/{agent_id}`：ak / ek 均为 200。SDK 继续按本地规范要求管理员令牌；本次只记录契约差异，不能据此判断存在越权漏洞。
- `GET /coding/runner-image-policies`：ek 返回 403；ak 返回 503，结构化错误原因为 `runner_deployment_not_configured`。该失败限于镜像策略端点，现有 Runner 的准备和 Coding Turn 已成功。

## 发现与复测

1. **Coding Agent 读取权限需要对齐。** 本地规范声明列表、详情需要 ak，当前服务接受 ek。上一轮只读复测仍确认列表 ek 返回 200；没有放宽 SDK 映射或测试期望以消除失败。
2. **镜像策略端点需要服务端检查。** ak 请求持续返回 503 / `runner_deployment_not_configured`；这不代表整个 Coding 环境不可用。
3. **实例准备的空请求体存在兼容差异。** 省略 input 时实际返回 400；改为 `client.coding.agents.ensureRunnerInstance(agentId, {}, options)` 后两次均返回 202。当前可使用显式 `{}`，规范的可选请求体与服务实现仍需对齐。
4. **归档后的读取可返回 404。** 会话归档返回 200 后，详情读取返回 404。原清理断言将它误报为失败；脚本现已接受归档后隐藏记录的结果，独立复核也确认该会话为 404。
5. **连通性与 Chat 配置分别判定。** 原测试要求 `doctor().pass` 为 true，因此把缺少 active custom Chat Agent 计为失败。修正后只要求配置、协议与服务连通性通过；上一轮只读复测只剩前两项失败。

完整 Coding 轮次记录 **102 次请求、48 个不同 HTTP 操作**：200 × 77、201 × 7、202 × 4、403 × 11、404 × 2、503 × 1。403 来自预期拒绝；两个 404 分别是 SSH 公钥读取未找到记录、归档后会话不可见；503 来自镜像策略接口。单次下载链接的两次直接访问不在 SDK 请求统计中。此前提前结束的尝试和后续独立复核也不计入这 102 次请求。

上一轮只读权限复测记录 **35 次请求、14 个不同 HTTP 操作**：200 × 29、403 × 5、503 × 1；1 项测试失败、退出码 1，未创建新资源。10:00 SGT 复测及 14:34–14:35 SGT 独立诊断结果见本文前部。

## 临时资源清理

包括提前结束的两次尝试，本轮共创建 3 个临时 Coding Agent、1 个新 Runner 实例、1 个工作区、1 个会话、2 个附件和 1 个 Turn。测试在 `finally` 中关闭流并按依赖逆序清理，只处理本轮记录的资源；未删除现有 Profile 或已有共享实例。

| 资源 | 清理及复核证据 |
| --- | --- |
| 3 个临时 Agent | 删除后独立列表复核均已不存在 |
| 1 个新实例 | 删除返回 202，列表中消失；独立详情复核为 404 |
| 1 个工作区 | 删除返回 200，随后列表确认消失 |
| 1 个会话 | 归档返回 200，独立详情复核为 404 |
| 1 个 Turn | 已自然完成，无需取消；关联会话已归档 |
| 2 个附件 | 无独立删除 API；随会话和工作区清理后的保留行为由服务决定，未引用上传附件按服务约定 24 小时过期 |

上述结果表示 API 层面的清理完成，**不表示物理数据全部清除**。实例软删除会保留 volume，会话归档保留历史；附件的最终存储清理未直接核验。未调用 SSH key ensure / rotate，未修改 Git 身份；没有验证其他服务操作是否会隐式创建密钥。

## 复现与证据

使用已配置的 `.env.local` 运行聚焦验收：

```sh
node --env-file=.env.local --import tsx --test --test-concurrency=1 --test-name-pattern='ak/ek|Coding' tests/live-migration.ts
```

修正测试判定后的上一轮及 10:00 SGT 复测均仅覆盖只读权限：

```sh
node --env-file=.env.local --import tsx --test --test-concurrency=1 --test-name-pattern='read-only ak/ek' tests/live-migration.ts
```

脚本为 [tests/live-migration.ts](../tests/live-migration.ts)。本机证据保存在被 Git 忽略的 `test-results/`，不随仓库提供：

- `live-0.3.0-coding.json` / `live-0.3.0-coding.log`：完整 Coding 轮次、权限差异及原始清理判定。
- `live-0.3.0-followup.json`：3 个 Agent、实例与会话的独立清理复核，以及 `doctor()` 各项结果。
- `live-0.3.0-image-policy-diagnostic.json`：14:34–14:35 SGT 原生请求的完整脱敏错误及同一 ak 的 3 次接口对照，共 4 次只读请求。
- `live-0.3.0-config-retest.json` / `live-0.3.0-config-retest.log`：10:00 SGT 只读复测，38 次请求。
- `live-0.3.0-config-retest-error.json`：10:01:57 SGT 镜像策略错误的独立脱敏诊断与服务端请求 ID。
- `live-0.3.0-permissions.json` / `live-0.3.0-permissions.log`：上一轮只读复测，35 次请求；通用输出 `live-migration.json` 会被下一次运行覆盖。
- `live-0.3.0-initial.*` / `live-0.3.0-second.*`：前两次提前结束的尝试；第二次记录省略实例准备 input 时的 400。

## 验证边界

上一轮测试脚本与报告更新后，`pnpm lint`、`pnpm typecheck`、`pnpm docs:build`、`pnpm docs:check` 通过；文档构建校验 173 段示例、264 个导出和全部内部锚点。没有重新执行完整 `pnpm check`，升级阶段的全量离线结果单独保留在 [VALIDATION.md](./VALIDATION.md)。

本次使用已有应用 Coding 配置、新建 Agent 和空工作区，只执行 1 个最小模型 Turn；没有连接代码仓库，也未运行完整 `pnpm test:live`。以上 48 个操作不等于全部 152 个操作的验收。普通消息流、本轮未发生的 Coding `error → turn.failed → 下一轮`、真实浏览器 CORS、仓库克隆、交互审批、客户端工具结果回填、实例管理的全部写操作及其他管理接口不在本次真实服务覆盖内。Coding 错误事件的连续读取仍以离线回归为证据。

未调用模型测试、标题生成或记忆重建，未轮换密钥，未执行 Git 提交、推送或发布。在线规范与本地文件的完整一致性仍未核对。SDK 离线检查与历史记录见 [VALIDATION.md](./VALIDATION.md)。

---

# /v1/zai 真实环境验证（0.2.0 历史记录）

验证日期：2026-09-29。使用项目 `.env.local` 的测试凭据，连接 `https://zai-zjy.sh.oop.cc/v1/zai`；通过当前源码中的 SDK 发出真实 HTTP 请求，没有使用 mock。日志不保存令牌、应用密钥、签名密钥或业务响应正文。

## 结果

`pnpm test:live`：**5 项集成测试全部通过，0 失败、0 跳过，约 25 秒**。

| 范围 | 实测结果 |
| --- | --- |
| ak / ek | 两种令牌均被服务端接受；短有效期令牌续期后再次读取成功 |
| 权限 | 7 个普通读取操作接受 ak / ek；5 个管理员读取操作接受 ak、拒绝 ek（HTTP 403） |
| `getToken(admin)` | 普通接口收到 `false`，模型与 Runner 管理接口收到 `true`，返回对应令牌后真实调用成功 |
| `doctor()` | 配置、协议、连接和可用 custom Agent 检查通过 |
| 普通会话 | 创建、读取、列表、更新、JSON 消息、SSE、消息历史、上传/下载 UTF-8 文件、重置上下文并保留历史、删除均通过 |
| Chat | 创建/读取/更新/删除会话；指定会话与便捷端点各自的 JSON/SSE 均通过，共 4 轮对话；消息查询、单条删除与清空通过 |
| 文件提取 | 仅含 `file` 的 multipart 上传成功，提取结果与中文 UTF-8 原文一致 |
| QA | 新建实际返回 201；同 key upsert 返回 200 且 ID 不变；读取、更新、删除通过 |
| Coding 工作区 | 新建独立 Runner Agent 和空工作区；工作区读取/PUT 更新、AGENTS.md 写入/读取、空仓库列表与模型目录通过 |
| Coding 会话 | 创建、读取、列表、工具集及交互列表读取通过；启动 turn 返回 202，最终状态为 `completed` 且返回文本 |
| Coding 事件 | 收到 3 个 SSE 事件并识别 turn 终态；持久化事件回放与 `after_seq` 续传均通过，退出迭代后关闭连接 |
| 清理 | 普通/Chat 会话、QA 条目、工作区和临时 Runner Agent 已删除；Coding 会话已归档 |

权限读取的具体范围：

- ak / ek 均成功：`GET /agents`、`GET /sessions`、`GET /chat/conversations`、`GET /coding/sessions`、`GET /memories`、`GET /qa/pairs`、`GET /skills`。
- 仅 ak 成功，ek 返回 403：`GET /models`、`GET /channels`、`GET /signing_secret`、`GET /coding/runners`、`GET /memories/queue/stats`。

补充迁移测试单独记录了 **80 次请求、48 个不同 HTTP 操作**：200 × 70、201 × 4、202 × 1、403 × 5。这 5 次 403 全部来自主动验证管理员接口拒绝 ek 的测试。上述请求统计不包含原有普通会话测试的请求。

## 复现与证据

```sh
pnpm test:live
```

该命令串行执行两个文件，使用 `.env.local` 中的 `TEST_ZAI_BASE_URL`、`TEST_ZAI_APP_ID`、`TEST_ZAI_APP_KEY` 和 `TEST_ZAI_USER_ID`：

- [基础实测](../tests/live.test.ts)：双令牌续期、普通会话与文件。
- [补充迁移实测](../tests/live-migration.ts)：权限、`getToken(admin)`、Chat、QA、文件提取与独立 Coding 工作区。
- 脱敏请求记录 `test-results/live-migration.json`：补充测试的状态、HTTP 方法、模板路径、令牌类型和耗时；每次运行覆盖，目录被 Git 忽略，不随仓库提供。
- 本次完整日志 `test-results/live.log`：5 项测试及清理结果，目录被 Git 忽略，不随仓库提供。

补充脚本通过 TypeScript 和 ESLint 检查。新建资源使用 `zai-sdk-migration-<UUID>` 标记，并在 `finally` 中使用独立超时清理。Coding 使用在线 Codex Runner、新建 Agent 和空工作区，请求只回复 `OK`；没有连接已有代码仓库。

## 验证边界

本次通过的是上述真实流程，**不是全部 120 个操作的服务端权限矩阵验收**。没有执行模型/渠道配置修改、签名或 SSH 密钥轮换、Git 提交/推送/创建 PR，也没有验证仓库克隆/文件读取、技能包写入、记忆内容写入/向量检索、交互审批、turn 取消/插话及浏览器对真实服务的跨域访问。

真实测试会消耗少量模型用量并创建临时记录；删除和归档遵循服务端自身的数据保留语义。本次不包含 npm 发布、消费项目迁移或 Git 提交/推送。
