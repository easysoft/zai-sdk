# /v1/zai 真实环境验证

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
