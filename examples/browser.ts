// 安装到浏览器项目后，将导入路径改为 'zai-sdk'。
import {createZAIClient, createZAITokenProvider} from '../src/index.js';

/** 业务后端根据当前登录用户返回 {token, expiresAt}，expiresAt 为 Unix 秒。 */
export function createBrowserZAIClient(baseUrl = '/v1/zai', tokenEndpoint = '/api/zai/token') {
  return createZAIClient({
    baseUrl,
    getToken: createZAITokenProvider({
      acquireTimeoutMs: 30_000, // 只限制 Token 获取，业务请求可另设 signal。
      fetchToken: async signal => {
        const response = await fetch(tokenEndpoint, {credentials: 'same-origin', headers: {accept: 'application/json'}, signal});
        if (!response.ok) throw new Error('Unable to obtain a ZAI token from the application backend.');
        return response.json();
      },
    }),
  });
}
