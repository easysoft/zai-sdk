import {defineConfig, devices} from '@playwright/test';

const port = Number(process.env.ZAI_TEST_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('ZAI_TEST_PORT must be a valid TCP port.');
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {baseURL, trace: 'retain-on-failure'},
  webServer: {
    command: `pnpm exec vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`,
    url: `${baseURL}/tests/browser/index.html`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}},
  ],
});
