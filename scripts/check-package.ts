import {execFile} from 'node:child_process';
import {mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {promisify} from 'node:util';
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
    if (!/^package\/(dist\/|docs\/index\.html$|package\.json$|zai-openapi\.json$|README\.md$|LICENSE$)/.test(file) || /(?:^|\/)\.env/.test(file)) {
      throw new Error(`Unexpected file in package: ${file}`);
    }
  }
  for (const file of ['dist/index.js', 'dist/index.d.ts', 'dist/index.js.map', 'docs/index.html', 'zai-openapi.json', 'README.md', 'LICENSE']) {
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
  await writeFile(join(temporary, 'package.json'), '{"type":"module","private":true}');
  await writeFile(join(temporary, 'consumer.mjs'), `
import assert from 'node:assert/strict';
import {createZAITokenProvider, createZAIClient, ZAIClientError} from 'zai-sdk';
const getToken = createZAITokenProvider({credentials:{appID:'package',appKey:'fixture',userID:'user'}});
const client = createZAIClient({baseUrl:'https://example.test/v8',getToken,fetch:async request => {
  assert.ok(request.headers.get('authorization').startsWith('Bearer ak-'));
  if (new URL(request.url).pathname.endsWith('/models')) return Response.json({models:[]});
  return Response.json({agents:[]});
}});
assert.deepEqual(await client.agents.list(), {agents:[]});
const diagnosis = await client.doctor();
assert.equal(diagnosis.pass, false);
assert.equal(diagnosis.details.find(detail => detail.type === 'server').pass, true);
assert.equal(new ZAIClientError('http','test').code,'http');
`);
  await run(process.execPath, ['consumer.mjs'], {cwd: temporary});
  await writeFile(join(temporary, 'consumer.ts'), `
import {createZAIClient, type ModelsListQuery, type SessionsCreateInput, type ZAIStreamEvent, type ZAIDoctorResult} from 'zai-sdk';
const query: ModelsListQuery = {all:'true'};
const session: SessionsCreateInput = {executor_provider:'codex',skills:[]};
const event: ZAIStreamEvent = {type:'done'};
const client = createZAIClient({baseUrl:'https://example.test/v8',getToken:()=> 'token'});
const diagnosis: Promise<ZAIDoctorResult> = client.doctor({chat:false});
void client.models.list(query); void session; void event; void diagnosis;
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
  console.log(`Package verified: ${files.length} files; ESM import, declarations and browser bundle passed.`);
} finally {
  await rm(temporary, {recursive: true, force: true});
}
