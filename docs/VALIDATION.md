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
