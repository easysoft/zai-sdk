import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {test, expect} from './fixtures.js';

test('documentation links, resource methods and exported APIs are complete', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/docs/index.html');
  await expect(page).toHaveTitle('ZAI SDK · 使用指南与接口参考');
  await expect(page.locator('.operation')).toHaveCount(72);
  await expect(page.locator('.type-entry')).toHaveCount(126);
  const broken = await page.locator('a[href^="#"]').evaluateAll(links => links
    .map(link => link.getAttribute('href')!.slice(1))
    .filter(id => !document.getElementById(id)));
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});

test('search supports method names, IME composition, clearing and no results', async ({page}) => {
  await page.goto('/docs/index.html');
  const input = page.getByRole('searchbox', {name: '搜索文档'});
  await page.keyboard.press('/');
  await expect(input).toBeFocused();
  await input.dispatchEvent('compositionstart');
  // fill() commits native composition in Firefox; dispatch the composing input.
  await input.evaluate(element => {
    (element as HTMLInputElement).value = 'messages.stream';
    element.dispatchEvent(new InputEvent('input', {bubbles: true, isComposing: true}));
  });
  await expect(page.locator('#search-results')).toBeHidden();
  await input.dispatchEvent('compositionend');
  await expect(page.locator('#search-results')).toBeVisible();
  await input.press('ArrowDown');
  await expect(page.locator('#search-list a').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#api-messages-stream')).toHaveAttribute('open', '');
  await expect(page.locator('#api-messages-stream > summary')).toBeFocused();
  await expect(page.locator('#search-results')).toBeHidden();
  await input.fill('missing-unfindable-xxxx');
  await expect(page.locator('#search-status')).toContainText('没有找到相关内容');
  await page.getByRole('button', {name: '清除搜索'}).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.locator('#search-results')).toBeHidden();
});

test('deep links reveal full nested request and response fields', async ({page}) => {
  await page.goto('/docs/index.html#api-sessions-create');
  const operation = page.locator('#api-sessions-create');
  await expect(operation).toHaveAttribute('open', '');
  await expect(operation.locator('td').filter({hasText: /^reference_settings\.memories\.collections$/})).toBeVisible();
  await expect(operation.locator('td').filter({hasText: /^session\.id$/})).toBeVisible();
  await operation.getByRole('link', {name: 'SessionsCreateInput', exact: true}).click();
  await expect(page.locator('#type-SessionsCreateInput')).toHaveAttribute('open', '');
  await page.goBack();
  await expect(page).toHaveURL(/#api-sessions-create$/);
  await expect(operation).toHaveAttribute('open', '');
});

test('documentation works from a standalone local file without network access', async ({page, context}) => {
  // WebKit offline emulation also blocks file: navigation. Deny all network
  // requests explicitly, while permitting the local document itself to load.
  const networkRequests: string[] = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) networkRequests.push(request.url()); });
  await context.route(/^https?:\/\//, route => route.abort());
  await page.goto(pathToFileURL(resolve(import.meta.dirname, '../../docs/index.html')).href + '#api-models-list');
  await expect(page.locator('#api-models-list')).toHaveAttribute('open', '');
  await page.getByRole('searchbox', {name: '搜索文档'}).fill('uploadFile');
  await expect(page.locator('#search-list')).toContainText('sessions.uploadFile');
  expect(networkRequests).toEqual([]);
});

test('narrow layout keeps navigation, code and schema tables usable', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/docs/index.html');
  await expect(page.locator('#sidebar')).toBeHidden();
  await page.getByRole('button', {name: '目录', exact: true}).click();
  await expect(page.locator('#sidebar')).toBeVisible();
  await page.locator('#sidebar').getByRole('link', {name: '流式响应 SSE', exact: true}).click();
  await expect(page.locator('#sidebar')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/docs/index.html#api-messages-send');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('#api-messages-send > summary')).toBeInViewport();
});

test('copy failure gives a useful manual fallback', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('denied'))}});
    document.execCommand = () => false;
  });
  await page.goto('/docs/index.html#quickstart');
  await page.locator('#quickstart [data-copy]').first().click();
  await expect(page.getByRole('status').filter({hasText: '代码已选中'})).toBeVisible();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain('pnpm install');
});

test('the guide and interface details remain readable without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/docs/index.html#resource-agents');
    await page.locator('#api-agents-create > summary').click();
    await expect(page.locator('#api-agents-create .operation-body')).toBeVisible();
    await expect(page.locator('.search-box')).toBeHidden();
  } finally {
    await context.close();
  }
});
