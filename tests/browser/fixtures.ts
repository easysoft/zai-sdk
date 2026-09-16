import {execFileSync} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test as base, expect} from '@playwright/test';

const isolateFirefoxData = process.platform === 'darwin'
  && Number(execFileSync('/usr/bin/sw_vers', ['-productVersion'], {encoding: 'utf8'}).trim().split('.')[0]) >= 27;

export const test = base.extend({
  launchOptions: [async ({browserName, launchOptions}, use) => {
    if (browserName !== 'firefox' || !isolateFirefoxData) {
      await use(launchOptions);
      return;
    }
    // macOS 27 denies directly launched Firefox access to its default app-data
    // before it even considers Playwright's temporary -profile argument.
    // Official workaround: https://bugzilla.mozilla.org/show_bug.cgi?id=2060476#c7
    // Isolate only the affected test process; leave user data and settings alone.
    const appData = await mkdtemp(join(tmpdir(), 'zai-sdk-firefox-data-'));
    try {
      await use({...launchOptions, env: {...process.env, ...launchOptions.env, MOZ_APP_DATA: appData}});
    } finally {
      await rm(appData, {recursive: true, force: true});
    }
  }, {scope: 'worker'}],
});

export {expect};
