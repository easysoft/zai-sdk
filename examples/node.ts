// 仓库内运行：node --env-file=.env.local --import tsx examples/node.ts
// 安装到其他项目后，将导入路径改为 'zai-sdk'。
import {createZAIClient, createZAITokenProvider} from '../src/index.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const fixtureUrl = new URL(required('TEST_ZAI_BASE_URL'));
if (fixtureUrl.pathname === '/') fixtureUrl.pathname = '/v8';
const client = createZAIClient({
  baseUrl: fixtureUrl.href,
  getToken: createZAITokenProvider({
    credentials: {
      appID: required('TEST_ZAI_APP_ID'),
      appKey: required('TEST_ZAI_APP_KEY'),
      userID: required('TEST_ZAI_USER_ID'),
    },
  }),
});

const [{agents}, {models}] = await Promise.all([client.agents.list(), client.models.list()]);
console.log(`Available agents: ${agents.length}; models: ${models.length}`);
