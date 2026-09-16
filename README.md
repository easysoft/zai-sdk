# zai-sdk

面向 Node.js 22+ 和现代浏览器的 ZAI TypeScript SDK。使用原生 Fetch、ESM，提供类型声明、source map、按请求自动续期的 Token 提供器，以及保留完整事件数据的 SSE 消息流。

第一版 `0.1.0` 以仓库根目录的 [`zai-openapi.json`](./zai-openapi.json) 为唯一接口来源，覆盖 43 个路径、71 个 HTTP 操作。`messages.stream()` 与 `messages.send()` 对应同一个 HTTP 操作的两种返回模式。

## HTML 使用文档

用浏览器打开 [`docs/index.html`](./docs/index.html)，即可阅读中文使用指南、全部资源方法及公开导出的接口参考。页面包含接口搜索、可复制示例、嵌套字段、枚举、默认值和 HTTP 状态，支持移动端与离线使用，无需启动服务；打包后的 SDK 也包含该文件。

```sh
pnpm docs:build  # 根据当前 OpenAPI、SDK 导出和指南重新生成 HTML
pnpm docs:check  # 校验接口覆盖、示例类型、内部链接和生成结果
```

文档维护方式见 [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md)。`pnpm check` 会检查文档是否过期，`pnpm pack` 会自动重新生成文档。

## 安装与使用

当前交付为本地可打包项目。先在 SDK 仓库安装依赖、构建并打包，再在消费项目安装生成的包：

```sh
pnpm install
pnpm build
pnpm pack --pack-destination /tmp/zai-sdk-pack
# 在消费项目中执行：
pnpm add /tmp/zai-sdk-pack/zai-sdk-0.1.0.tgz
```

SDK 输出 ESM；浏览器项目可通过 Vite 等工具导入。运行时代码不依赖 Node 内置模块。

```ts
import {createZAIClient, createZAITokenProvider} from 'zai-sdk';

// Node.js 服务端：凭据来自服务端环境变量。
const getToken = createZAITokenProvider({
  credentials: {appID, appKey, userID},
  expiresInSeconds: 1000,
  refreshBeforeSeconds: 60,
});

const client = createZAIClient({
  baseUrl: 'https://zai.example.com/v8',
  getToken,
});

const {agents} = await client.agents.list();
const {models} = await client.models.list();
const page = await client.sessions.list({page: 1, page_size: 20});
```

`baseUrl` 是包含 `/v8` 的 API 根地址；浏览器也可使用相对地址 `/v8`。构造选项支持自定义 `fetch` 和默认 `headers`。每个资源方法的最后一个参数接受 `{signal, headers}`；如需跳过可选的查询或请求体，可显式传入 `undefined`：

```ts
await client.models.list(undefined, {
  signal: AbortSignal.timeout(10_000),
  headers: {'X-Request-ID': 'request-123'},
});
```

## Token 生成与自动续期

`createZAIToken(appID, appKey, userID, expiredTime?)` 按 ZAI 的 MD5 + Base64 协议签发 Token，默认过期时间为当前 Unix 秒加 1000。保持协议原有的 `btoa` 语义：`appID`、`userID` 必须能按 Latin-1 编码；`appKey` 按 UTF-8 参与 MD5。

`createZAITokenProvider()` 返回可直接传给客户端的 `getToken`，两种来源互斥：

- `credentials`：在当前运行环境本地重签，默认有效期 1000 秒。
- `fetchToken`：向业务后端获取 `{token, expiresAt}`；`expiresAt` 必须是未来的整数 Unix **秒**，不是毫秒。

```ts
// 浏览器：业务后端保存 appKey，根据已登录用户签发 Token。
const getToken = createZAITokenProvider({
  fetchToken: async () => {
    const response = await fetch('/api/zai/token', {credentials: 'same-origin'});
    if (!response.ok) throw new Error('获取 ZAI Token 失败');
    return response.json(); // {token: 'ak-...', expiresAt: 1893457000}
  },
  refreshBeforeSeconds: 60,
});
const client = createZAIClient({baseUrl: 'https://zai.example.com/v8', getToken});
```

提供器首次使用时获取 Token，剩余有效期不超过提前续期窗口时，在下一次请求前续期。并发请求共享同一次续期；每个提供器独立缓存，没有后台定时器。续期失败会报错，后续调用可以重试。新 Token 若仍有效但已进入提前窗口，本次请求会直接使用它，不在一次调用内重复刷新。

取消单个 API 请求不会取消其他请求共享的 Token 获取。切换用户时创建新的提供器和客户端。浏览器示例从业务后端获取 Token，前端包中不保存 `appKey`。

客户端也支持任意同步或异步 `getToken: () => string | Promise<string>`，但这类函数的缓存和续期由调用方负责。SDK 不在 401 后自动重放请求，不因 Token 更新而重连已经建立的 SSE。

## 消息、流与文件

```ts
const {session} = await client.sessions.create(agentID, {
  title: 'SDK 示例',
  skills: [],
  reference_settings: {memories: {collections: []}},
});

const input = {content: [{type: 'input_text' as const, text: '用一句话介绍自己'}]};
const response = await client.messages.send(session.id, input); // 固定 stream:false
console.log(response.content);

const controller = new AbortController();
const stream = await client.messages.stream(session.id, input, {signal: controller.signal});
for await (const event of stream) {
  if (event.type === 'done') break;
  console.log(event.event, event.data);
}
```

SSE 数据事件为 `{type:'data', event, id?, rawData, data}`，结束事件为 `{type:'done'}`。`data` 为 `unknown`，使用前请按应用需要缩小类型。SDK 保留完整 chunk，包括所有 choice、工具调用增量、usage 和新字段。它不自动执行工具。

使用 `break` 提前结束 `for await` 会释放流；如果取得流后还未开始迭代就放弃，可调用 `await stream.return()` 或取消关联 `AbortSignal`。异常 JSON、错误事件、超过 1 MiB 的 SSE 解析缓冲、缺少 `[DONE]` 的意外结束会报错。已建立的流不会自动重试或重连。

```ts
// 浏览器 File，也可以直接传 Blob（默认文件名为 blob）。
await client.sessions.uploadFile(session.id, {
  path: 'input/report.txt',
  file: new File(['报告'], 'report.txt', {type: 'text/plain'}),
});

// Node.js 和浏览器均可使用带文件名的 Blob。
await client.sessions.uploadFile(session.id, {
  path: 'input/report.txt',
  file: {blob: new Blob(['报告'], {type: 'text/plain'}), filename: 'report.txt'},
});
const blob = await client.sessions.downloadFile(session.id, {path: 'input/report.txt'});
console.log(await blob.text());

// 技能包支持 JSON 文件列表或 ZIP；二进制技能文件使用 ZIP。
await client.skills.validateBundle({files: [{path: 'SKILL.md', media_type: 'text/markdown', content: '# Example'}]});
await client.skills.validateBundle({bundle: {blob: zipBlob, filename: 'skill.zip'}});
```

## 资源与返回结构

| 资源 | 能力 |
| --- | --- |
| `agents` | Agent 查询、创建、修改、删除 |
| `executor` | 公钥、密钥轮换、工作区 AGENTS.md |
| `workspaces` | Agent 工作区管理 |
| `repositories` | 仓库管理、文件查询与下载 |
| `sessions` | 会话管理、上下文重置、标题、文件、图片生成 |
| `messages` | JSON/SSE 发送、历史与消息管理 |
| `agentSkills` | Agent 技能挂载、更新、卸载 |
| `skills` | 技能管理、恢复、包校验、版本与内容 |
| `models` | 可用模型与历史模型查询 |
| `memories` | 记忆集合、内容、分块、向量检索与任务状态 |

路径 ID 按路径顺序作为独立字符串参数；查询和请求体保持 OpenAPI 字段命名。例：`client.repositories.get(agentID, workspaceID, repositoryID)`。列表只读取一页，保留 `page`、`page_size`、`total`、`has_more` 等服务端信息。`models.list({all:'true'})` 可请求历史模型；SDK 兼容数组及 `{models}` 两种服务端结构，统一返回 `{models}`。

`executor_provider`、`custom_data` 等字段直接按规范传递；SDK 不替应用合并 `custom_data`，合并及清空行为由相应 API 定义。所有资源方法都导出相应的 `*Input`、`*Query`、`*Response` 类型（存在对应输入时），也可导入底层 `paths`、`components` 类型。

错误使用 `ZAIClientError`，`code` 为 `authentication`、`http`、`network`、`aborted`、`invalid-input` 或 `invalid-response`。HTTP 错误保留可用的 `status`、`body`、`headers`、`method`、`path`。正常响应里的 `ok:false` 原样返回，由业务处理。不要把完整请求头或错误对象直接记录到公开日志中。

## 开发、测试与规范更新

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm test          # 离线单元/契约测试 + 三种真实浏览器
pnpm check         # 生成一致性、lint、类型、覆盖率、浏览器、构建及包检查
```

Node.js CI 覆盖 22/24；浏览器测试使用 Chromium、Firefox、WebKit，通过 Vite 加载实际 `dist` 产物并发出原生 Fetch 请求，由 Playwright 拦截响应；multipart 上传由本地 HTTP 测试端点读取真实文件内容。macOS 27+ 的 Firefox 测试会自动使用并清理隔离的临时 app-data，处理其直接启动时的系统兼容问题。默认自动测试无需真实服务器或凭据。非生成运行时代码覆盖率门槛：行、语句、函数 90%，分支 85%；每个 HTTP 操作都有契约用例。

真实服务测试需单独运行：

```sh
cp .env.example .env.local
# 编辑 TEST_ZAI_BASE_URL / TEST_ZAI_APP_ID / TEST_ZAI_APP_KEY / TEST_ZAI_USER_ID
pnpm test:live
```

`TEST_ZAI_BASE_URL` 可以包含 `/v8`，也可以只填写服务器 origin；测试和 Node 示例的环境适配器会为 origin 追加 `/v8`。公开 SDK 的 `baseUrl` 仍需明确填写 API 根地址。可选 `TEST_ZAI_AGENT_ID` 指定活跃的 custom Agent；未指定时优先选择默认的活跃 custom Agent，否则选择第一个符合条件的 Agent。测试使用短有效期 Token 验证续期后真实鉴权；创建唯一标记的临时会话，发送两条短提示，验证 JSON/SSE、历史、文件和上下文重置。该测试会消耗少量模型用量，始终在 `finally` 尝试删除自己创建的会话；清理失败使测试失败并报告会话 ID，便于处理。

`.env.local`、测试产物与源代码中的测试文件不进入发布包；CI 不执行真实服务测试。完整示例位于 [`examples`](./examples)：Node 环境读取、浏览器后端 Token、消息和文件操作。

更新 API 时，直接替换根目录 `zai-openapi.json`，然后执行：

```sh
pnpm generate:api
pnpm check
```

生成类型、资源方法和操作清单通过脚本维护。新增或移除操作时同步修改 `scripts/operations.ts` 中的资源映射，再补充契约及类型用例。不要单独手改生成文件；`pnpm check:api` 会拒绝遗漏操作或过期产物。

## 边界

SDK 处理鉴权、HTTP 和流协议。业务缓存、重试策略、UI 状态和工具执行由消费项目负责；请求不会自动重放。本版本交付本地 SDK，不执行消费项目迁移或 npm 发布。
