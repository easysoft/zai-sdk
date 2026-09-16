import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import ts from 'typescript';
import {ZAI_OPERATIONS} from '../src/operations.js';
import {code, escape, groups, guideExamples, makeGuides, operationNotes, operationTitles} from '../docs/content.js';

interface Schema {
  type?: string | string[];
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  additionalProperties?: boolean | Schema;
  oneOf?: Schema[];
  anyOf?: Schema[];
  allOf?: Schema[];
  enum?: unknown[];
  format?: string;
  default?: unknown;
  example?: unknown;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  minLength?: number;
  minItems?: number;
  maxItems?: number;
  [key: string]: unknown;
}
interface Parameter {name: string; in: string; required?: boolean; description?: string; schema: Schema}
interface Operation {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: {required?: boolean; description?: string; content: Record<string, {schema: Schema}>};
  responses: Record<string, {description?: string; content?: Record<string, {schema?: Schema}>}>;
}
interface Spec {paths: Record<string, Record<string, Operation>>; components: {schemas: Record<string, Schema>}}
const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFile(resolve(root, path), 'utf8');
const spec = JSON.parse(await read('zai-openapi.json')) as Spec;
const manifest = JSON.parse(await read('package.json')) as {name: string; version: string};
const guides = makeGuides(manifest.version);
const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const expected = Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item).filter(method => httpMethods.has(method)).map(method => `${method} ${path}`)).sort();
const actual = ZAI_OPERATIONS.map(operation => `${operation.method} ${operation.path}`).sort();
if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('API operation manifest is stale. Run pnpm generate:api first.');

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true, skipLibCheck: true, noEmit: true,
};
const program = ts.createProgram([resolve(root, 'src/index.ts')], compilerOptions);
const checker = program.getTypeChecker();
const entry = program.getSourceFile(resolve(root, 'src/index.ts'))!;
const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(entry)!).map(symbol => {
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  return {name: symbol.name, declaration: resolved.declarations?.[0]};
}).sort((a, b) => a.name.localeCompare(b.name, 'en'));
const clientSource = program.getSourceFile(resolve(root, 'src/client.ts'))!;
const resourceMethods = new Map<string, ts.MethodDeclaration>();
function visit(node: ts.Node): void {
  if (ts.isMethodDeclaration(node) && ts.isObjectLiteralExpression(node.parent) && ts.isPropertyAssignment(node.parent.parent)) {
    resourceMethods.set(`${node.parent.parent.name.getText()}.${node.name.getText()}`, node);
  }
  ts.forEachChild(node, visit);
}
visit(clientSource);
const methodKeys = [...ZAI_OPERATIONS.map(op => `${op.group}.${op.name}`), 'messages.stream'];
if (resourceMethods.size !== methodKeys.length || methodKeys.some(key => !resourceMethods.has(key))) {
  throw new Error('The documentation mapping does not cover the current public resource methods.');
}

const upper = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const camel = (s: string) => s.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
const apiID = (s: string) => `api-${s.replace('.', '-')}`;
const typeID = (s: string) => `type-${s}`;
const inline = (s = '') => escape(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
const table = (headers: string[], rows: string[][]) => `<div class="table-wrap" tabindex="0" role="region" aria-label="${escape(headers.join('、'))}"><table><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const required = (yes: boolean) => yes ? '<span class="required">必填</span>' : '<span class="optional">可选</span>';

function describeType(schema: Schema): string {
  if (schema.enum) return schema.enum.map(value => JSON.stringify(value)).join(' | ');
  const variants = schema.oneOf ?? schema.anyOf;
  if (variants) return [...new Set(variants.map(describeType))].join(' | ') || 'unknown';
  if (schema.allOf) return schema.allOf.map(describeType).join(' & ');
  const types = Array.isArray(schema.type) ? schema.type : [schema.type ?? (schema.properties ? 'object' : 'unknown')];
  return types.map(type => type === 'array' ? `Array<${describeType(schema.items ?? {})}>` : type === 'integer' ? 'integer' : type).join(' | ');
}

function constraints(schema: Schema): string {
  const parts: string[] = [];
  if (schema.description) parts.push(inline(schema.description));
  const labels: Record<string, string> = {format: '格式', default: '默认值', example: '示例', minimum: '最小值', maximum: '最大值', exclusiveMinimum: '必须大于', minLength: '最小长度', minItems: '最少项数', maxItems: '最多项数'};
  for (const [key, label] of Object.entries(labels)) {
    if (schema[key] !== undefined) parts.push(`<span class="constraint">${label}：<code>${escape(JSON.stringify(schema[key]))}</code></span>`);
  }
  if (schema.additionalProperties === false) parts.push('不接受额外属性。');
  if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) parts.push('允许额外属性。');
  return parts.join('<br>') || '<span class="muted">—</span>';
}

function renderSchema(schema: Schema, mode: 'request' | 'response', multipart = false): string {
  const rows: string[][] = [];
  const state = (yes: boolean) => mode === 'request' ? required(yes) : (yes ? '<span class="required">保证存在</span>' : '<span class="optional">可能省略</span>');
  function walk(current: Schema, path: string, isRequired: boolean, addRow: boolean): void {
    if (addRow) rows.push([
      `<code class="field-path">${escape(path || '$')}</code>`,
      `<code>${escape(multipart && current.format === 'binary' ? 'ZAIUploadFile' : describeType(current))}</code>`,
      state(isRequired), constraints(current),
    ]);
    for (const [key, child] of Object.entries(current.properties ?? {})) {
      walk(child, path ? `${path}.${key}` : key, !!current.required?.includes(key), true);
    }
    if (current.items) walk(current.items, `${path || '$'}[]`, true, true);
    for (const kind of ['oneOf', 'anyOf', 'allOf'] as const) {
      current[kind]?.forEach((variant, i) => walk(variant, `${path || '$'} (${kind} ${i + 1})`, true, true));
    }
    if (current.additionalProperties && typeof current.additionalProperties === 'object') {
      walk(current.additionalProperties, `${path || '$'}[key]`, false, true);
    }
  }
  walk(schema, '', true, !schema.properties);
  return `<p class="schema-type">结构：<code>${escape(describeType(schema))}</code>${schema.description ? ` · ${inline(schema.description)}` : ''}</p>${rows.length ? table(['字段', '类型', mode === 'request' ? '要求' : '存在性', '说明 / 约束'], rows) : '<p>规范没有定义固定字段，使用时需检查实际数据。</p>'}`;
}

function schemaExample(schema: Schema, field = ''): unknown {
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];
  const choice = schema.oneOf?.[0] ?? schema.anyOf?.[0];
  if (choice) return schemaExample(choice, field);
  if (schema.allOf) return Object.assign({}, ...schema.allOf.map(item => schemaExample(item, field)));
  const type = Array.isArray(schema.type) ? schema.type.find(t => t !== 'null') : schema.type;
  if (type === 'object' || schema.properties) {
    const names = schema.required?.length ? schema.required : Object.keys(schema.properties ?? {}).slice(0, 1);
    return Object.fromEntries(names.filter(key => key !== 'stream').map(key => [key, schemaExample(schema.properties?.[key] ?? {}, key)]));
  }
  if (type === 'array') return [schemaExample(schema.items ?? {}, field)];
  if (type === 'number' || type === 'integer') return schema.minimum ?? (schema.exclusiveMinimum !== undefined ? schema.exclusiveMinimum + 1 : 1);
  if (type === 'boolean') return false;
  if (type === 'null') return null;
  if (type === 'string') {
    if (schema.format === 'uri') return 'https://example.com';
    if (field === 'path') return 'input/report.txt';
    if (field === 'name' || field === 'title') return '示例名称';
    if (field === 'key') return 'example-key';
    if (field === 'content' || field === 'text') return '你好，请介绍一下自己。';
    if (field === 'query') return '如何开始使用？';
    if (field === 'version') return '1';
    return `your-${field.replaceAll('_', '-') || 'value'}`;
  }
  return {};
}

const snippets: {key: string; source: string}[] = [];
function operationExample(key: string, op: Operation, params: readonly string[]): string {
  const args = params.map(name => JSON.stringify(name === 'version' ? '1' : `your-${name.replaceAll('_', '-')}`));
  const query = op.parameters?.filter(p => p.in === 'query') ?? [];
  if (query.length) {
    const chosen = query.some(p => p.required) ? query.filter(p => p.required) : query.filter(p => ['page', 'page_size', 'all', 'path'].includes(p.name));
    args.push(JSON.stringify(Object.fromEntries((chosen.length ? chosen : query.slice(0, 1)).map(p => [p.name, schemaExample(p.schema, p.name)])), null, 2));
  }
  if (op.requestBody) {
    if (key === 'sessions.uploadFile') args.push(`{\n  path: 'input/report.txt',\n  file: {blob: new Blob(['报告正文'], {type: 'text/plain'}), filename: 'report.txt'},\n}`);
    else if (key === 'messages.send' || key === 'messages.stream') args.push(`{\n  content: [{type: 'input_text', text: '你好，请介绍一下自己。'}],\n}`);
    else if (key === 'skills.validateBundle' || key === 'skills.publishRevision') args.push(`{\n  files: [{path: 'SKILL.md', media_type: 'text/markdown', content: '# Example\\nSummarize a report.'}],\n}`);
    else args.push(JSON.stringify(schemaExample(op.requestBody.content['application/json']?.schema ?? {}), null, 2));
  }
  const call = `await client.${key}(${args.join(', ')})`;
  const source = key === 'messages.stream'
    ? `const stream = ${call};\nfor await (const event of stream) {\n  if (event.type === 'done') break;\n  console.log(event.event, event.data);\n}`
    : `const result = ${call};\nconsole.log(result);`;
  snippets.push({key, source});
  return code(source);
}

function renderOperation(meta: (typeof ZAI_OPERATIONS)[number], stream = false): string {
  const key = `${meta.group}.${stream ? 'stream' : meta.name}`;
  const op = spec.paths[meta.path]![meta.method]!;
  const method = resourceMethods.get(key)!;
  const name = operationTitles[key];
  if (!name) throw new Error(`Missing user-facing title: ${key}`);
  const typePrefix = upper(meta.group) + upper(meta.name);
  const params = method.parameters.map(param => param.getText(clientSource)).join(',\n  ');
  const signature = `client.${key}(\n  ${params}\n): ${method.type!.getText(clientSource)}`;
  const pathParams = meta.pathParams.map((name, index) => {
    const param = op.parameters?.find(item => item.in === 'path' && item.name === name);
    return [`<code>${escape(camel(name))}</code>`, '<code>string</code>', required(true), `第 ${index + 1} 个位置参数，对应 <code>${escape(name)}</code>。${inline(param?.description ?? param?.schema.description)}`];
  });
  const parameterHTML = pathParams.length ? `<h4>路径参数</h4>${table(['参数', '类型', '要求', '说明'], pathParams)}` : '';
  const query = op.parameters?.filter(item => item.in === 'query') ?? [];
  const queryHTML = query.length ? `<h4>查询参数 <a class="type-link" href="#${typeID(typePrefix + 'Query')}">${typePrefix}Query</a></h4>${table(['参数', '类型', '要求', '说明 / 约束'], query.map(p => [`<code>${escape(p.name)}</code>`, `<code>${escape(describeType(p.schema))}</code>`, required(!!p.required), constraints({...p.schema, description: p.description ?? p.schema.description})]))}` : '';
  const bodyHTML = Object.entries(op.requestBody?.content ?? {}).map(([media, {schema}]) => {
    // stream is selected by the SDK method, never accepted by MessagesSendInput.
    const sdkSchema = meta.group === 'messages' && meta.name === 'send' ? {...schema, properties: Object.fromEntries(Object.entries(schema.properties ?? {}).filter(([name]) => name !== 'stream'))} : schema;
    const inputParam = method.parameters.find(p => p.name.getText() === 'input');
    return `<h4>请求体 <a class="type-link" href="#${typeID(typePrefix + 'Input')}">${typePrefix}Input</a></h4><p class="muted">${escape(media)} · SDK input 参数${inputParam?.questionToken ? '可省略' : '必填'}${media === 'multipart/form-data' ? '；二进制字段由 SDK 转为 FormData。' : ''}</p>${renderSchema(sdkSchema, 'request', media === 'multipart/form-data')}`;
  }).join('');
  const responseHTML = stream ? `<h4>返回值</h4><p><code>Promise&lt;AsyncIterableIterator&lt;<a href="#type-ZAIStreamEvent">ZAIStreamEvent</a>&gt;&gt;</code></p><p>HTTP 200，text/event-stream。<code>type: 'data'</code> 包含 event、id?、rawData 和 unknown 类型的 data；<code>type: 'done'</code> 表示正常完成。完整处理方式见 <a href="#streaming">流式响应 SSE</a>。</p>` : `<h4>返回值 <a class="type-link" href="#${typeID(typePrefix + 'Response')}">${typePrefix}Response</a></h4>` + Object.entries(op.responses).filter(([status]) => /^2\d\d$/.test(status)).map(([status, response]) => Object.entries(response.content ?? {}).filter(([media]) => media !== 'text/event-stream').map(([media, {schema}]) => `<p class="response-status">HTTP ${status} · ${escape(media)}</p>${media === 'application/octet-stream' ? '<p>SDK 返回 <code>Blob</code>，可使用 <code>text()</code>、<code>arrayBuffer()</code> 或浏览器下载流程。</p>' : schema ? renderSchema(schema, 'response') : '<p>规范未定义响应字段。</p>'}`).join('')).join('');
  const responses = Object.entries(op.responses).map(([status, response]) => [`<code>${escape(status)}</code>`, inline(response.description), /^2\d\d$/.test(status) ? '正常返回' : '抛出 ZAIClientError，保留可用的 status 和 body']);
  return `<details class="operation" id="${apiID(key)}" data-search-entry data-search-title="${escape(key + ' · ' + name)}" data-search-kind="接口" data-operation="${key}">
<summary><span class="method method-${meta.method}">${meta.method.toUpperCase()}</span><span class="operation-label"><code>${key}()</code><span>${name}</span></span><span class="disclosure" aria-hidden="true">＋</span></summary>
<div class="operation-body"><div class="endpoint"><code>${escape(meta.path)}</code><a href="#${apiID(key)}" class="permalink" aria-label="${escape(key)} 的永久链接">#</a></div>
${op.description ? `<p>${inline(op.description)}</p>` : ''}${operationNotes[key] ? `<aside class="note"><p>${inline(operationNotes[key])}</p></aside>` : ''}
<h4>调用签名</h4>${code(signature)}<p class="muted">所有方法最后均可传入 <a href="#type-ZAIRequestOptions">ZAIRequestOptions</a>；示例中的 ID 请替换为真实值。</p>
${parameterHTML}${queryHTML}${bodyHTML}<h4>调用示例</h4>${operationExample(key, op, meta.pathParams)}${responseHTML}
<details class="response-details"><summary>HTTP 状态与原始接口定义</summary>${table(['状态', '规范说明', 'SDK 行为'], responses)}<p>下方保留完整 HTTP 规范，包含嵌套字段、联合类型、默认值、约束及所有响应。SDK 的文件上传、流式开关和模型列表适配以上方说明为准。</p>${code(JSON.stringify({method: meta.method.toUpperCase(), path: meta.path, ...op}, null, 2), 'JSON / OpenAPI')}</details></div></details>`;
}

const apiGroups = Object.entries(groups).map(([group, info]) => {
  const ops = ZAI_OPERATIONS.filter(op => op.group === group);
  return `<section class="resource-section" id="resource-${group}"><header class="resource-heading"><div><span class="eyebrow">client.${group}</span><h3>${info.title}</h3></div><span class="count">${ops.length + (group === 'messages' ? 1 : 0)} 个方法</span></header><p>${info.description}</p>${ops.map(op => renderOperation(op) + (group === 'messages' && op.name === 'send' ? renderOperation(op, true) : '')).join('')}</section>`;
}).join('');

const coreDescriptions: Record<string, string> = {
  createZAIClient: '创建资源客户端。baseUrl 与 getToken 必填，返回 ZAIClient。',
  createZAIToken: '使用服务端凭据签发 Token。expiredTime 默认为当前 Unix 秒加 1000。',
  createZAITokenProvider: '创建按请求缓存并续期的 Token 提供器。',
  ZAIClientError: 'SDK 错误类；按 code 分支处理，可附带 HTTP 信息和 cause。',
  ZAIClient: 'createZAIClient 的返回类型，包含全部资源方法。',
  CreateZAIClientOptions: '客户端构造选项：API 根地址、Token 提供器、自定义 Fetch 和默认请求头。',
  ZAIRequestOptions: '所有资源方法的末尾选项：AbortSignal 和单次请求头。',
  ZAIUploadFile: '支持 File / Blob，或显式指定文件名的 Blob。',
  ZAIStreamEvent: 'SSE 数据事件或完成事件；data 以 unknown 保留。',
  ZAICredentials: '服务端签名凭据：appID、appKey、userID。',
  ZAIToken: 'Token 与有效期；expiresAt 使用整数 Unix 秒。',
  ZAITokenProvider: '异步 Token 获取函数：() => Promise<string>。',
  ZAITokenProviderOptions: 'credentials 与 fetchToken 二选一，支持提前续期窗口。',
  ZAIErrorCode: '六个稳定错误类别：authentication、http、network、aborted、invalid-input、invalid-response。',
  ZAIErrorOptions: '构造 SDK 错误时使用的可选上下文。',
  paths: '完整 OpenAPI 路径类型；通过路径、HTTP 方法、响应状态继续索引。',
  components: 'OpenAPI components 类型；当前规范没有命名 schemas。',
};
const coreLinks: Record<string, string> = {
  createZAIClient: 'requests', createZAIToken: 'authentication', createZAITokenProvider: 'authentication',
  ZAIClientError: 'errors', ZAIStreamEvent: 'streaming', ZAIUploadFile: 'files',
};
function declarationText(name: string, declaration: ts.Declaration): string {
  if (ts.isFunctionDeclaration(declaration)) {
    const signature = checker.getSignatureFromDeclaration(declaration)!;
    return `export declare function ${name}${checker.signatureToString(signature, declaration, ts.TypeFormatFlags.NoTruncation).replace(/: \{[\s\S]*$/, ': ZAIClient')};`;
  }
  if (ts.isClassDeclaration(declaration)) return `export class ZAIClientError extends Error {\n  constructor(code: ZAIErrorCode, message: string, options?: ZAIErrorOptions);\n  readonly code: ZAIErrorCode;\n  readonly status?: number;\n  readonly body?: unknown;\n  readonly method?: string;\n  readonly path?: string;\n  readonly headers?: Headers;\n}`;
  if (name === 'paths') return `import type {paths} from 'zai-sdk';\ntype Agents = paths['/agents']['get']['responses'][200]['content']['application/json'];`;
  if (name === 'components') return declaration.getText();
  return declaration.getText();
}
const typeEntries = exported.map(({name, declaration}) => {
  if (!declaration) throw new Error(`Missing declaration: ${name}`);
  const owner = ZAI_OPERATIONS.find(op => ['Input', 'Query', 'Response'].some(suffix => name === upper(op.group) + upper(op.name) + suffix));
  const link = owner ? apiID(`${owner.group}.${owner.name}`) : coreLinks[name];
  const description = owner ? `${owner.group}.${owner.name}() 的${name.endsWith('Input') ? '请求体' : name.endsWith('Query') ? '查询参数' : '返回值'}类型。` : coreDescriptions[name];
  if (!description) throw new Error(`Undocumented public export: ${name}`);
  return `<details class="type-entry" id="${typeID(name)}" data-search-entry data-search-title="${name}" data-search-kind="导出 API"><summary><code>${name}</code><span class="disclosure" aria-hidden="true">＋</span></summary><div class="type-body"><p>${description}${link ? ` <a href="#${link}">查看${owner ? '接口字段与示例' : '使用指南'} →</a>` : ''}</p>${code(declarationText(name, declaration))}</div></details>`;
}).join('');

// Typecheck the displayed snippets without executing them or contacting a server.
const virtualPath = resolve(root, 'docs/__examples__.ts');
const imports = exported.map(({name, declaration}) => (declaration && (ts.isFunctionDeclaration(declaration) || ts.isClassDeclaration(declaration)) ? name : `type ${name}`)).join(', ');
const allSnippets = [...guideExamples.map((source, i) => ({key: `guide-${i + 1}`, source})), ...snippets];
const exampleSource = `import {${imports}} from '../src/index.js';\ndeclare const client: ZAIClient;\n` + allSnippets.map(({key, source}, i) => `// ${key}\nasync function example${i}() {\n${source.replace(/^import .*?from 'zai-sdk';\s*$/gm, '')}\n}\n`).join('\n');
const host = ts.createCompilerHost(compilerOptions);
const originalSource = host.getSourceFile.bind(host);
host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => file === virtualPath
  ? ts.createSourceFile(file, exampleSource, languageVersion, true)
  : originalSource(file, languageVersion, onError, shouldCreateNewSourceFile);
const exampleProgram = ts.createProgram([virtualPath], compilerOptions, host);
const diagnostics = ts.getPreEmitDiagnostics(exampleProgram);
if (diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: file => file, getCurrentDirectory: () => root, getNewLine: () => '\n',
}));

const css = await read('docs/styles.css');
const browserSource = await read('docs/interactions.ts');
const script = ts.transpileModule(browserSource, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}}).outputText;
const themeScript = ts.transpileModule(await read('docs/theme.ts'), {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}}).outputText;
const guideNav = guides.map(guide => `<a href="#${guide.id}">${guide.title}</a>`).join('');
const resourceNav = Object.entries(groups).map(([key, info]) => `<a href="#resource-${key}"><span>${info.title}</span><code>${key}</code></a>`).join('');
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="ZAI SDK 中文使用文档：安装、鉴权、流式消息、文件与 ${expected.length} 个 HTTP 操作的完整接口参考。"><title>ZAI SDK · 使用指南与接口参考</title><script>${themeScript.replace(/<\/script/gi, '<\\/script')}</script><style>${css}</style></head>
<body><a class="skip-link" href="#main">跳转到文档正文</a>
<header class="topbar"><a class="brand" href="#overview" aria-label="ZAI SDK 文档首页"><span class="brand-mark" aria-hidden="true">Z</span><strong>ZAI <span>SDK</span></strong><span class="version">v${escape(manifest.version)}</span></a><div class="top-links"><a href="#quickstart">使用指南</a><a href="#api-reference">接口参考</a><a href="#types">导出 API</a></div>
<div class="search-box" role="search"><label class="sr-only" for="doc-search">搜索文档</label><span class="search-icon" aria-hidden="true">⌕</span><input id="doc-search" type="search" placeholder="搜索文档、方法、参数…" autocomplete="off" aria-controls="search-results"><button type="button" id="clear-search" aria-label="清除搜索" hidden>×</button><kbd aria-hidden="true">/</kbd><section id="search-results" aria-label="搜索结果" hidden><p id="search-status" role="status" aria-live="polite"></p><ul id="search-list"></ul></section></div><div class="theme-control" hidden><label class="sr-only" for="theme-select">配色模式</label><select id="theme-select"><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></div><button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="sidebar">目录</button></header>
<div class="layout"><aside id="sidebar" class="sidebar"><nav aria-label="文档目录"><a class="overview-link" href="#overview">文档概览 <span>↗</span></a><p class="nav-label">使用指南</p>${guideNav}<p class="nav-label">接口参考 <span>${expected.length}</span></p>${resourceNav}<p class="nav-label">SDK 参考</p><a href="#types">函数与类型索引</a></nav><div class="sidebar-foot">TypeScript · ESM<br>Node.js 22+ / 现代浏览器</div></aside>
<main id="main"><section id="overview" class="hero"><p class="eyebrow">ZAI SDK / 开发者文档</p><h1>将 ZAI 接入<br>你的应用<span class="title-dot">.</span></h1><p class="hero-description">从第一条消息开始，连接 Agent、工作区、技能与记忆。<br>这里有完整的接入指南，以及每个接口的调用方式。</p><div class="hero-actions"><a class="button-primary" href="#quickstart">开始接入 <span>→</span></a><a class="button-secondary" href="#api-reference">查阅接口 <span>↗</span></a></div><div class="coverage-strip"><span><strong>${Object.keys(groups).length}</strong> 类资源</span><span><strong>${expected.length}</strong> 个 HTTP 操作</span><span><strong>${methodKeys.length}</strong> 个 SDK 方法</span><span>完整 TypeScript 类型</span></div></section>
<section class="reading-path"><h2>找到你需要的内容</h2><div class="path-grid"><a href="#quickstart"><span class="path-symbol" aria-hidden="true">↳</span><strong>第一次接入</strong><span>安装 → 鉴权 → 发送消息</span></a><a href="#streaming"><span class="path-symbol" aria-hidden="true">≈</span><strong>接收流式响应</strong><span>事件结构、取消与资源释放</span></a><a href="#api-reference"><span class="path-symbol" aria-hidden="true">{ }</span><strong>查找某个接口</strong><span>签名、参数、返回值与示例</span></a></div></section>
<div class="part-heading"><span>使用指南</span><p>从环境准备到常见场景</p></div>
${guides.map(guide => `<section class="guide-section" id="${guide.id}" data-search-entry data-search-title="${guide.title}" data-search-kind="指南"><header><p class="eyebrow">使用指南</p><h2>${guide.title}<a class="heading-anchor" href="#${guide.id}" aria-label="${guide.title}的永久链接">#</a></h2><p class="section-description">${guide.description}</p></header>${guide.body}</section>`).join('')}
<section class="reference-intro" id="api-reference" data-search-entry data-search-title="接口参考与调用约定" data-search-kind="指南"><p class="eyebrow">API REFERENCE</p><h2>接口参考</h2><p>按资源浏览 ${methodKeys.length} 个方法。展开后可查看调用签名、全部嵌套字段、必填性、枚举、默认值、HTTP 状态与调用示例。</p><aside class="note"><p>下方 HTTP 路径相对于 <code>baseUrl</code>（通常以 /v8 结尾）。示例默认已有 <code>client</code>，需替换占位 ID。响应中的“保证存在”指规范声明，“可能省略”指非 required 字段；嵌套必填规则仅在父对象存在时适用，允许 null 与可省略是不同含义。字段说明保留原始规范文本。</p></aside><div class="resource-index">${Object.entries(groups).map(([key, info]) => `<a href="#resource-${key}"><strong>${info.title}</strong><code>${key}</code></a>`).join('')}</div></section>
${apiGroups}
<section class="exports-section" id="types"><p class="eyebrow">SDK EXPORTS</p><h2>函数与类型索引</h2><p>覆盖入口 <code>zai-sdk</code> 的全部 ${exported.length} 个公开导出。资源类型以 <code>资源名 + 方法名 + Input / Query / Response</code> 命名。<code>messages.stream()</code> 复用 <code>MessagesSendInput</code>，通过 <code>ZAIStreamEvent</code> 返回事件。</p><p>从包内导入：<code>import type {SessionsCreateInput} from 'zai-sdk'</code>。包子路径 <code>zai-sdk/openapi.json</code> 提供完整 HTTP 规范。</p>${typeEntries}</section>
<footer class="footer"><strong>ZAI SDK <span>v${escape(manifest.version)}</span></strong><p>使用指南与完整接口参考 · 中文文档</p><a href="#overview">返回顶部 ↑</a></footer></main></div>
<div class="toast" id="copy-status" role="status" aria-live="polite" hidden></div><script>${script.replace(/<\/script/gi, '<\\/script')}</script></body></html>\n`;

// Validate links and generated coverage before writing a reviewable artifact.
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]!);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs.');
for (const [, href] of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(href!)) throw new Error(`Broken anchor: ${href}`);
for (const key of methodKeys) if (!ids.includes(apiID(key))) throw new Error(`Missing resource method: ${key}`);
for (const {name} of exported) if (!ids.includes(typeID(name))) throw new Error(`Missing export: ${name}`);
const output = resolve(root, 'docs/index.html');
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8').catch(() => '') !== html) throw new Error('docs/index.html is stale. Run pnpm docs:build.');
} else {
  await mkdir(resolve(root, 'docs'), {recursive: true});
  await writeFile(output, html);
}
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Generated'} docs/index.html: ${expected.length} HTTP operations, ${methodKeys.length} SDK methods, ${exported.length} exports; ${allSnippets.length} examples typechecked; all anchors valid.`);
