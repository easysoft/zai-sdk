import {execFile} from 'node:child_process';
import {rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const root = new URL('../', import.meta.url);
await rm(new URL('dist/', root), {recursive: true, force: true});
await promisify(execFile)(process.execPath, [fileURLToPath(new URL('node_modules/typescript/bin/tsc', root)), '-p', 'tsconfig.build.json'], {cwd: fileURLToPath(root)});
