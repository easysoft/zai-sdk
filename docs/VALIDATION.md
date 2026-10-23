# OpenAPI 契约增量验证（2026-10-22）

本轮按更新后的本地 OpenAPI 适配仓库下载、仓库 relative_path、正式 Coding SSE 和计划模式说明。`pnpm check` 完整执行成功，退出码 0；改动未暂存、未提交、未推送或发布。下面的 2026-10-16 记录保留为历史结果。

| 检查 | 本次结果 |
| --- | --- |
| 规范覆盖 | 原始 100 条路径、153 个 HTTP 操作、55 个公共 Schema；156 个资源方法 |
| 补充规范 | paths 为空，原包导出保留，重复路径校验仍有效 |
| 权限映射 | 36 个仅 ak、109 个共享 ak/ek、8 个仅 ek；幂等键要求仍为 11 个操作 |
| API / 文档生成一致性 | 通过 |
| ESLint / TypeScript | 通过 |
| 单元测试 | 821 项通过，11 个测试文件 |
| 覆盖率 | statements 98.70%，branches 97.92%，functions 100%，lines 99.81% |
| Chromium / Firefox / WebKit | 69 项通过，每个浏览器 23 项 |
| 文档示例与链接 | 175 段示例类型检查通过；266 个导出、全部内部锚点有效 |
| 实际打包消费 | 38 个文件；ESM、类型声明、单文件 UMD（global/CommonJS/AMD）及浏览器打包通过 |

新增回归覆盖仓库下载的 ak/ek 选择、特殊字符路径、原始字节与空文件、404/503 错误，以及必填 relative_path 类型。Coding 示例验证正常 EOF 后按游标续接、去重、忽略其他 Turn 的终态、保留 session.updated 的实际 plan_mode、取消及通道失败时清理。Last-Event-ID 请求头和超过旧 16,000 字符长度的 system_prompt 均验证原样传递。

首次完整检查在浏览器启动阶段遭到 macOS 沙箱的 MachPortRendezvous 权限拒绝，尚未执行页面断言；获准以正常本机权限重新运行后，完整检查通过。没有修改浏览器配置、放宽断言或调整测试超时。

真实服务范围仅为 [仓库下载权限核对](./LIVE-VALIDATION.md)：官方文档确认共享 ak/ek，4 次只读探针未创建资源或运行模型。测试用户没有现成工作区，缺失资源的下载请求均为 404，因此没有声称实际文件下载已验收；未执行完整 `pnpm test:live`，也未复测历史服务差异。

---

# ZAI SDK 0.3.0 验证记录（2026-10-16 历史记录）

验证日期：2026-10-16。本轮完成本地 SDK 升级、生成产物、中文文档及离线验收，随后在 `zai-dev` 完成新版 Coding 与 ak / ek 的聚焦真实服务验收。Coding 主流程已跑通，权限和服务契约仍有待对齐项；没有提交、推送或发布。

最新镜像策略独立诊断完成于 **2026-10-16 14:34–14:35 SGT**：绕过 SDK 的原生 `fetch` 仍返回 503 / `runner_deployment_not_configured`，请求 ID 为 `7c2d4c34-1ef9-46cf-85b1-843d2555fbd6`。随后使用同一个 ak 读取 Runner 列表和 Coding Agent 列表均为 200，镜像策略仍为 503，请求 ID 为 `233bac91-972a-4ecf-9e88-15e9d896ea3d`。完整脱敏响应的 `details.message` 只重复错误码，没有具体缺失配置项或 `retryable`；SDK 保留服务端正文和响应头，不生成该 503。需要服务端按请求 ID 和错误码触发分支继续定位，不能据此推断具体环境变量或配置是否已加载。这 4 次请求均只读，无新资源和清理任务；详见 [最新诊断与完整脱敏错误](./LIVE-VALIDATION.md)。

此前只读复测完成于 **2026-10-16 10:00 SGT**：用户报告补齐配置后，镜像策略接口的 ak 请求仍返回 503 / `runner_deployment_not_configured`，Coding Agent 列表和既有 Agent 详情仍接受 ek。共 38 次请求、15 个操作（200 × 32、403 × 5、503 × 1），1 项测试失败、退出码 1；其他只读权限及令牌回调检查通过，本次 `doctor()` 全部通过。没有创建或修改资源、执行 Turn、消耗模型用量或新增清理任务。该结果不能确认配置是否生效或服务未恢复的具体原因；证据与明细见 [真实服务复测](./LIVE-VALIDATION.md)。本次脚本更新后的 TypeScript 与定向 ESLint 检查通过。

## 规范与接口覆盖

| 项目 | 结果 |
| --- | --- |
| 原始 OpenAPI | 98 条路径、151 个操作、55 个公共 Schema |
| 合并现有 Coding SSE 补充后 | 99 条路径、152 个 HTTP 操作、155 个资源方法 |
| 权限映射 | 36 个仅 ak、108 个共享 ak/ek、8 个仅 ek |
| 幂等键 | 11 个规范要求的操作自动生成；显式选项优先于请求头 |
| 成功状态 | 全部与本地规范一致，包括 202；SDK 不推断任务完成 |

原始规范保留用户提供的版本，补充规范继续只新增路径。附件 required-only anyOf 的规范化仅作用于生成器内存副本。操作映射记录具体权限与协议来源，详见 [完整 API 文档](./index.html) 和 [迁移说明](./MIGRATION.md)。

## 实际检查结果

SDK 升级阶段执行了 `pnpm generate:api`、`pnpm docs:build`，最终完整 `pnpm check` 返回成功。下表保留该阶段结果，不代表本轮真实验收脚本更新后重新执行了完整离线检查。

| 检查 | 结果 |
| --- | --- |
| API / 文档生成一致性 | 通过 |
| ESLint / TypeScript | 通过 |
| 单元测试 | 805 项通过，10 个测试文件 |
| 覆盖率 | statements 98.70%，branches 97.92%，functions 100%，lines 99.81% |
| Chromium / Firefox / WebKit | 66 项通过，每个浏览器 22 项 |
| 文档示例与链接 | 173 段示例类型检查通过；264 个导出、全部内部锚点有效 |
| 实际打包消费 | 38 个文件；ESM、类型声明、单文件 UMD（global/CommonJS/AMD）及浏览器打包通过 |

回归覆盖全部操作的请求与权限、模型目录默认 ek 和显式 admin、幂等键自动生成与复用、结构化 errorInfo、无 path multipart 与旧路径上传、原始 Blob（含零字节）、Coding 下载互斥选择器、工具结果单次序列化及发送前校验。类型检查确认附件不退化为 unknown，工具结果和下载选择器保持必填互斥。

三种 SSE 分别验证普通消息的 DONE 与错误行为、合法 Coding error → turn.failed → 下一轮事件连续返回、Runner 状态流正常 EOF，以及取消和提前退出时的 reader 清理。浏览器测试验证真实 multipart/二进制 HTTP 上传、下载、状态流和持久会话流。

浏览器在获准的沙箱外环境运行。新版完整文档的逐操作 DOM trace 快照使 WebKit 搜索测试超时；关闭该文档测试的 DOM 快照后保留截图、网络与操作记录，同一用例单独运行 1.5 秒通过，最终全量浏览器检查通过，未放宽断言或超时。打包测试的 UMD 沙箱补齐了浏览器原生 FormData 与 URLSearchParams。

## 验证边界

上述 `pnpm check` 是 SDK 升级阶段的离线检查结果。随后运行了 `tests/live-migration.ts` 中 Coding 与 ak / ek 两项聚焦测试，没有运行完整 `pnpm test:live`。完整 Coding 轮次记录 102 次请求、48 个 HTTP 操作：仅名称创建 Agent、实例准备与状态流、工作区和会话幂等重放、Blob 与零字节附件、ek 原件下载、单次下载链接、1 个最小 Turn 完成、3 个 Coding SSE 事件及游标续传均通过。

真实测试整体未通过：Coding Agent 列表和详情实际接受 ek，与本地规范的管理员权限要求不同；镜像策略接口使用 ak 返回 503 / `runner_deployment_not_configured`，但现有 Runner 主流程可用。省略实例准备 input 时返回 400，显式 `{}` 可成功。原测试对归档后 404 和 `doctor()` 缺少 active custom Chat Agent 的判定已修正；上一轮只读复测记录 35 次请求、14 个操作，仍因列表权限差异和镜像策略 503 退出 1。10:00 SGT 复测及 14:34–14:35 SGT 独立诊断另见本文顶部。SDK 权限映射保持规范要求，未据此认定越权漏洞。

本轮共创建的 3 个临时 Agent、1 个新实例、1 个工作区和 1 个会话已删除或归档并复核；1 个 Turn 已完成，2 个附件遵循服务保留策略。实例 volume 和归档历史的保留不属于物理清除。未调用 SSH key ensure / rotate，未修改 Git 身份，也未连接代码仓库。详细结果、清理证据与复现命令见 [0.3.0 真实环境验证记录](./LIVE-VALIDATION.md)。

真实服务验收不覆盖全部 152 个操作、真实 Coding 错误事件的跨轮次连续读取或浏览器 CORS；在线规范与本地文件的完整一致性尚未核对。下方 0.2.0 实测记录仅作历史参考。

---

# ZAI SDK 0.2.0 验证记录

验证日期：2026-09-29。范围为本地 SDK、生成契约、文档、离线测试与真实服务集成测试；未执行 npm 发布或消费项目迁移。

## 规范核对

| 项目 | 结果 |
| --- | --- |
| 原始 OpenAPI | 77 条路径、119 个操作、47 个公共 Schema |
| Coding SSE 补充后 | 78 条路径、120 个操作、123 个资源方法 |
| 仅允许 ak | 20 个操作，自动模式选择 ak |
| 允许 ak 或 ek | 100 个操作，自动模式选择 ek |
| 仅允许 ek | 0 个操作 |
| 操作映射及权限遗漏、重复 | 0 |

每个接口的权限、来源、请求和返回结构见 [完整 API 文档](./index.html)。对应运行时清单在 [src/operations.ts](../src/operations.ts)，维护源在 [scripts/operations.ts](../scripts/operations.ts)。原始 OpenAPI 保留用户提供的更新，Coding SSE 记录于独立补充规范。

## SDK 离线验证

以下命令均已完成：

```sh
pnpm generate:api
pnpm docs:build
ZAI_TEST_PORT=4189 pnpm check
pnpm pack --pack-destination .
```

| 检查 | 结果 |
| --- | --- |
| API / 文档生成一致性 | 通过 |
| ESLint / TypeScript | 通过 |
| 单元测试 | 573 项通过，9 个测试文件 |
| 覆盖率 | statements 98.50%，branches 97.39%，functions 100%，lines 99.78% |
| Chromium / Firefox / WebKit | 54 项通过，每个浏览器 18 项 |
| 文档示例 | 139 个示例类型检查通过；205 个导出、全部内部锚点有效 |
| 实际打包消费 | 37 个文件；ESM 导入、类型声明、浏览器构建通过 |

离线测试逐项检查 120 个 HTTP 操作在显式 Token 与自动模式下的路径、方法、请求内容和 Authorization，包括独立列出的 20 个管理员操作，以及显式 getToken(admin) 接收的布尔参数。QA 的 200/201、Coding turn 的 202、旧入口类型错误、三组消息 JSON/SSE、真实 FormData、Coding 多 turn/心跳/游标/EOF/取消均有覆盖。

getToken(admin) 的回归验证包括：请求前选择权限、同步/异步回调、旧无参回调与固定类型 provider 兼容、并发请求使用独立 ak/ek 缓存、401/403 不重新获取或重放；三组消息流也核对 admin=false。三浏览器和打包后的消费者均验证新参数传递。

鉴权验证包括本地 ak、一次获取 signing secret、并发共享、缓存与续期、失败重试、超时和取消隔离、密钥响应校验和脱敏、401/403 不升级或重放。Node 和三浏览器验证 UTF-8 中文及 emoji、ak/ek hash 与昵称不参与签名。

本机 4173 端口被已有服务占用，因此使用可配置的 4189 端口。macOS 沙箱阻止浏览器启动，获准在沙箱外运行后通过。曾并行运行打包和浏览器检查，文档重新生成触发 Vite 重载；最终完整检查已串行执行并通过。

新增 getToken(admin) 后的检查中，文档搜索用例曾耗尽 30 秒总时限；将重复的控件查询限定在搜索组件内后，完整检查通过，未放宽交互断言或超时。

## 服务端实测

2026-09-29 已使用 `.env.local` 连接 `/v1/zai` 真实服务，`pnpm test:live` 的 5 项集成测试全部通过。覆盖双令牌续期和权限、普通会话与 Chat 的 JSON/SSE、文件上传/下载与文本提取、QA upsert、独立 Coding 工作区、turn、事件回放与游标续传。临时资源已删除或归档。详见 [真实环境验证记录](./LIVE-VALIDATION.md)。

补充迁移测试记录 80 次真实请求、48 个 HTTP 操作；5 次 403 均为预期的 ek 权限拒绝。20/100 的全量权限划分仍来自规范与文档，本次没有逐一实测全部 120 个操作，也未执行管理配置写入、密钥轮换或 Git 推送。

迁移规则及 Schema 已知矛盾见 [MIGRATION.md](./MIGRATION.md)。本地安装包为 `zai-sdk-0.2.0.tgz`，本次未提交、推送或发布。

## 2026-09-30 分批提交前复核

本次重新运行 API 与文档生成一致性检查、ESLint、TypeScript、单元测试及覆盖率：573 项测试通过，覆盖率与上表一致。用户令牌签发批次还在基于原始提交的独立快照中通过 104 项认证测试和源码类型检查；API 迁移暂存快照通过 120 个操作的生成检查、源码类型检查及全部 573 项单元测试。

浏览器检查使用 4189 端口，并在沙箱外启动浏览器。默认 6 个工作进程运行时，53 项通过，WebKit 搜索用例触及 30 秒总时限；保持原有断言与超时，通过 `ZAI_TEST_PORT=4189 pnpm exec playwright test --workers=2` 重跑后，Chromium、Firefox、WebKit 共 54 项全部通过。

修正迁移文档移入 `docs/` 后的相对链接和打包路径。`pnpm check:package` 通过，确认安装包包含 `docs/MIGRATION.md`，共 37 个文件，ESM 导入、类型声明和浏览器构建均通过。本次未重跑真实服务测试，上节实测结果仍为 2026-09-29 的记录；未推送或发布。
