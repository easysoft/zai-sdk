# HTML 文档维护

浏览器直接打开 `index.html`。该文件内嵌样式、脚本、接口参考与所有数据，不加载 CDN、远程字体或 API；可独立复制、离线打开，或放在任意静态服务器下。页面只展示文档，不执行示例中的服务调用。禁用 JavaScript 时正文和原生折叠内容仍可阅读。

## 生成与校验

```sh
pnpm docs:build
pnpm docs:check
```

- `content.ts`：中文使用指南、资源介绍、方法名称与 SDK 特殊行为说明；统一生成代码块并在构建时高亮。
- `styles.css`：静态文档的视觉样式与唯一运行时 token 定义。
- `interactions.ts`：本地搜索、锚点展开、复制反馈、窄屏目录和打印增强。
- `theme.ts`：首次绘制前恢复配色偏好，绑定主题选择并同步同源页面的偏好。
- `../scripts/generate-docs.ts`：读取 `zai-openapi.json` 和真实 SDK 导出，生成 HTML；校验 HTTP 操作与资源方法全覆盖、全部公开导出、示例的 TypeScript 类型和锚点。
- `index.html`：生成产物，不单独手改。源码或 OpenAPI 更新后重新生成并提交该文件。

接口字段与完整原始定义来自 OpenAPI，SDK 签名来自 TypeScript AST。上传类型、消息流开关、模型列表归一化等 SDK 行为另作说明。71 个 HTTP 操作对应 72 个资源方法，因为 `messages.send` 与 `messages.stream` 共享同一 HTTP 操作。导出总数由生成器实时计算。

新增操作时先按仓库流程运行 `pnpm generate:api`，再补充 `content.ts` 的中文方法名，运行 `pnpm docs:build` 和 `pnpm check`。公开导出或方法遗漏、示例类型错误、断链、重复锚点和陈旧产物均会使文档检查失败。生成与测试不会调用真实 ZAI 服务。

## 页面约定

这是面向 SDK 使用者的中文内容文档。正文优先，左侧按使用指南与资源组织导航；方法折叠展示，避免大段嵌套字段淹没目录。搜索结果可用键盘访问，点击锚点会展开对应接口，浏览器前进/后退与外部深链接均可用。

浅色采用白底、浅绿灰导航和墨绿代码区；深色采用墨绿灰底、浅色文字和薄荷绿链接。`styles.css` 的 `:root` 统一管理颜色与字体，通过 `light-dark()` 和 `color-scheme` 切换整套语义色。标题使用系统 Avenir Next / 中文黑体，正文使用系统界面字体，代码使用系统等宽字体，不依赖网络。资源方法的 HTTP 色标始终同时显示方法名。700px 以下目录切换为可展开区域；页面正文自然滚动，代码与宽表格自行横向滚动。

页头使用原生下拉框选择“跟随系统 / 浅色 / 深色”，下拉弹出层由浏览器管理。默认随系统偏好即时变化，手动选择保存在 localStorage 的 `zai-sdk-docs-theme` 中；选择跟随系统时清除覆盖。同源标签页同步偏好。禁用 JavaScript 时仍可通过 CSS 跟随系统；存储受限时本页仍可切换。打印始终使用浅色。`theme.ts` 内嵌在样式之前，避免已保存深色偏好的页面先闪现浅色。

搜索只保留当前页面的临时查询，不写入 URL、持久存储或远端。复制失败时选中代码并提示手动复制。打印时展开接口与类型，打印结束后恢复原有折叠状态。

代码高亮由构建依赖 [highlight.js](https://highlightjs.readthedocs.io/en/latest/api.html#highlight) 生成，仅注册 TypeScript、Bash 和 JSON 语法，分别对应代码块的 `typescript`、`Shell` 和 `JSON / OpenAPI` 标签。生成 HTML 保留原始代码文本并增加语义 span，页面不加载高亮脚本；离线或禁用 JavaScript 也能显示。`styles.css` 中的 `--syntax-*` 统一管理浅色和深色配色，复制仍使用 `textContent`，打印时回到白底黑字。

JSON 标点沿用代码正文颜色，生成时移除其不含嵌套标签的高亮 span，减少完整 OpenAPI 定义产生的冗余节点；字符串、键名、数字和关键字仍保留高亮。

浏览器检查复用仓库 Playwright 配置，覆盖三种浏览器、搜索与空结果、深链接、离线文件、窄屏和禁用脚本；通过 `pnpm test:browser` 运行。
