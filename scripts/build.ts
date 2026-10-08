import {execFile} from 'node:child_process';
import {rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {build} from 'vite';

const root = new URL('../', import.meta.url);
if (!process.argv.includes('--umd')) {
  await rm(new URL('dist/', root), {recursive: true, force: true});
  await promisify(execFile)(process.execPath, [fileURLToPath(new URL('node_modules/typescript/bin/tsc', root)), '-p', 'tsconfig.build.json'], {cwd: fileURLToPath(root)});
}

await build({
  root: fileURLToPath(root),
  configFile: false,
  publicDir: false,
  build: {
    target: 'es2022',
    outDir: process.env.OUT || 'dist',
    emptyOutDir: false,
    sourcemap: false,
    lib: {entry: fileURLToPath(new URL('src/index.ts', root)), name: 'ZAI', formats: ['umd'], fileName: () => 'zai.js'},
  },
});
