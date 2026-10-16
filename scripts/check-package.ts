import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {build} from 'vite';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'zai-sdk-package-'));
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {name: string; version: string; dependencies: Record<string, string>};
try {
  await run('pnpm', ['pack', '--pack-destination', temporary], {cwd: root});
  const archive = join(temporary, `${manifest.name}-${manifest.version}.tgz`);
  const {stdout: listing} = await run('tar', ['-tzf', archive]);
  const files = listing.trim().split('\n');
  for (const file of files) {
    if (!/^package\/(dist\/|docs\/(?:index\.html|MIGRATION\.md)$|package\.json$|zai-openapi(?:\.supplement)?\.json$|README\.md$|LICENSE$)/.test(file) || /(?:^|\/)\.env/.test(file)) {
      throw new Error(`Unexpected file in package: ${file}`);
    }
  }
  for (const file of ['dist/index.js', 'dist/index.d.ts', 'dist/index.js.map', 'dist/zai.js', 'docs/index.html', 'zai-openapi.json', 'zai-openapi.supplement.json', 'README.md', 'docs/MIGRATION.md', 'LICENSE']) {
    if (!files.includes(`package/${file}`)) throw new Error(`Missing package file: ${file}`);
  }

  // Exercise the actual tarball's exports, independent of the source checkout.
  // Runtime dependencies are reused locally so this check remains offline.
  const modules = join(temporary, 'node_modules');
  const packageDirectory = join(modules, manifest.name);
  await mkdir(packageDirectory, {recursive: true});
  await run('tar', ['-xzf', archive, '--strip-components', '1', '-C', packageDirectory]);
  for (const dependency of Object.keys(manifest.dependencies)) {
    const target = join(modules, dependency);
    if (dependency.startsWith('@')) await mkdir(join(modules, dependency.split('/')[0]!), {recursive: true});
    await symlink(join(root, 'node_modules', dependency), target, 'dir');
  }
  const umd = await readFile(join(packageDirectory, 'dist/zai.js'), 'utf8');
  const esm = await import(pathToFileURL(join(packageDirectory, 'dist/index.js')).href) as Record<string, unknown>;
  const commonjs = {exports: {}};
  const amd: Record<string, unknown> = {};
  const define = Object.assign((dependencies: string[], factory: (exports: object) => void) => {
    assert.deepEqual(Array.from(dependencies), ['exports']);
    factory(amd);
  }, {amd: true});
  runInNewContext(umd, {define});
  const globals = runInNewContext(`${umd}; ZAI;`, {URL, URLSearchParams, Blob, FormData, Request, Response, Headers, AbortController, DOMException, TextDecoder, TextEncoder, ReadableStream, crypto}) as Record<string, unknown>;
  runInNewContext(umd, {module: commonjs, exports: commonjs.exports});
  for (const exports of [globals, commonjs.exports, amd] as Record<string, unknown>[]) {
    assert.deepEqual(Object.keys(exports).sort(), Object.keys(esm).sort());
    for (const name of Object.keys(esm)) assert.equal(typeof exports[name], typeof esm[name]);
  }
  for (const exports of [esm, globals]) {
    const createClient = exports.createZAIClient as typeof import('../src/index.js').createZAIClient;
    const permissions: boolean[] = [];
    const client = createClient({baseUrl: 'https://example.test/v1/zai', getToken: admin => { permissions.push(admin); return admin ? 'ak-fixture' : 'ek-fixture'; }, fetch: async input => {
      const request = input as Request;
      const url = new URL(request.url);
      if (url.pathname.endsWith('/status/stream')) return new Response('event: runner.status\nid: 1\ndata: {"status":"ready"}\n\n', {headers: {'content-type': 'text/event-stream'}});
      if (url.pathname.endsWith('/files')) {
        assert.equal(url.searchParams.get('name'), 'text.txt');
        assert.equal(request.headers.get('content-type'), 'application/octet-stream');
        assert.equal(await request.text(), 'package upload');
        return Response.json({file_id: 'file'}, {status: 201});
      }
      assert.equal(request.headers.get('idempotency-key'), 'package-instance');
      return Response.json({accepted: true}, {status: 202});
    }});
    await client.coding.sessions.uploadFile('session', {name: 'text.txt'}, new Blob(['package upload']));
    const statuses = [];
    for await (const event of await client.coding.agents.streamStatus('agent')) statuses.push(event);
    assert.equal(statuses.length, 1);
    assert.equal(statuses[0]!.event, 'runner.status');
    assert.equal(JSON.stringify(statuses[0]!.data), '{"status":"ready"}');
    await client.coding.agents.ensureRunnerInstance('agent', {}, {idempotencyKey: 'package-instance', tokenType: 'user'});
    assert.deepEqual(permissions, [false, false, false]);
  }

  // A standalone UMD build emits one file and preserves its destination's contents.
  const umdDirectory = join(temporary, 'umd');
  await mkdir(umdDirectory);
  await writeFile(join(umdDirectory, 'keep.txt'), 'keep');
  await run('pnpm', ['build:umd'], {cwd: root, env: {...process.env, OUT: umdDirectory}});
  assert.deepEqual((await readdir(umdDirectory)).sort(), ['keep.txt', 'zai.js']);
  assert.equal(await readFile(join(umdDirectory, 'keep.txt'), 'utf8'), 'keep');
  assert.equal(await readFile(join(umdDirectory, 'zai.js'), 'utf8'), umd);

  await writeFile(join(temporary, 'package.json'), '{"type":"module","private":true}');
  await writeFile(join(temporary, 'consumer.mjs'), `
import assert from 'node:assert/strict';
import {createZAITokenProvider, createZAIClient, ZAIClientError} from 'zai-sdk';
import spec from 'zai-sdk/openapi.json' with {type:'json'};
import supplement from 'zai-sdk/openapi-supplement.json' with {type:'json'};
assert.ok(import.meta.resolve('zai-sdk/zai.js').endsWith('/dist/zai.js'));
assert.equal(Object.keys(spec.paths).length,98);
assert.equal(Object.keys(supplement.paths).length,1);
const getToken = createZAITokenProvider({credentials:{appID:'package',appKey:'fixture',userID:'user'}});
const permissions = [];
const client = createZAIClient({baseUrl:'https://example.test/v1/zai',getToken:admin=>{permissions.push(admin);return getToken();},fetch:async request => {
  assert.ok(request.headers.get('authorization').startsWith('Bearer ak-'));
  if (new URL(request.url).pathname.endsWith('/models')) return Response.json({models:[]});
  return Response.json({agents:[]});
}});
assert.deepEqual(await client.agents.list(), {agents:[]});
assert.deepEqual(await client.settings.models.list(), {models:[]});
assert.deepEqual(await client.settings.models.list({tokenType:'admin'}), {models:[]});
assert.deepEqual(permissions, [false,false,true]);
const diagnosis = await client.doctor();
assert.equal(diagnosis.pass, false);
assert.equal(diagnosis.details.find(detail => detail.type === 'server').pass, true);
assert.equal(new ZAIClientError('http','test').code,'http');
`);
  await run(process.execPath, ['consumer.mjs'], {cwd: temporary});
  await writeFile(join(temporary, 'consumer.ts'), `
import {createZAIClient, type CodingSessionsCreateInput, type ChatMessagesSendInput, type ZAIStreamEvent, type ZAIRunnerStatusStreamEvent, type ZAIDoctorResult} from 'zai-sdk';
const coding: CodingSessionsCreateInput = {workspace_id:'workspace',plan_mode:true};
const message: ChatMessagesSendInput = {content:'hello'};
const event: ZAIStreamEvent = {type:'done'};
const client = createZAIClient({baseUrl:'https://example.test/v1/zai',getToken:admin=> admin ? 'ak-token' : 'ek-token'});
const diagnosis: Promise<ZAIDoctorResult> = client.doctor({chat:false});
void client.settings.models.list();
void client.settings.models.list({tokenType:'admin'});
void client.coding.sessions.create('agent',coding,{idempotencyKey:'package-create'});
void client.coding.sessions.uploadFile('session',{name:'file.txt'},new Blob(['text']));
void client.coding.sessions.downloadFile('session',{file_id:'file'});
void client.coding.sessions.createDownloadLink('session',{path:'file.txt'});
void client.coding.toolCalls.resolve('session','tool',{output:null});
const statuses: Promise<AsyncIterableIterator<ZAIRunnerStatusStreamEvent>> = client.coding.agents.streamStatus('agent');
void client.chat.messages.send('conversation',message);
void client.files.extract({file:new Blob(['text'])});
void client.coding.events.stream('session',{after_seq:'0'});
void event; void diagnosis; void statuses;
`);
  await run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022,DOM,DOM.Iterable', 'consumer.ts'], {cwd: temporary});
  await writeFile(join(temporary, 'index.html'), '<script type="module" src="/consumer.ts"></script>');
  await build({root: temporary, configFile: false, logLevel: 'silent', build: {outDir: 'browser-dist', target: 'es2022'}});
  const assets = join(temporary, 'browser-dist/assets');
  for (const file of await readdir(assets)) {
    if (!file.endsWith('.js')) continue;
    const js = await readFile(join(assets, file), 'utf8');
    if (/from\s*["']node:|__vite-browser-external/.test(js)) throw new Error('Browser bundle contains a Node-only dependency.');
  }
  console.log(`Package verified: ${files.length} files; ESM import, declarations, single-file UMD (global/CommonJS/AMD) and browser bundle passed.`);
} finally {
  await rm(temporary, {recursive: true, force: true});
}
