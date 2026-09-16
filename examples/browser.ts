// 安装到浏览器项目后，将导入路径改为 'zai-sdk'。
import {createZAIClient, createZAITokenProvider} from '../src/index.js';

/** 业务后端根据当前登录用户返回 {token, expiresAt}，expiresAt 为 Unix 秒。 */
export function createBrowserZAIClient(baseUrl = '/v8', tokenEndpoint = '/api/zai/token') {
  return createZAIClient({
    baseUrl,
    getToken: createZAITokenProvider({
      fetchToken: async () => {
        const response = await fetch(tokenEndpoint, {credentials: 'same-origin', headers: {accept: 'application/json'}});
        if (!response.ok) throw new Error('Unable to obtain a ZAI token from the application backend.');
        return response.json();
      },
    }),
  });
}
