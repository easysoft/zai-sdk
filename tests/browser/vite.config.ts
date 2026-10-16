import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [{
    name: 'zai-browser-upload-fixture',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?')[0];
        if (request.method === 'GET' && path === '/v1/zai/coding/sessions/browser/stream') {
          response.setHeader('content-type', 'text/event-stream');
          const after = Number(new URL(request.url!, 'http://test').searchParams.get('after_seq') ?? 0);
          response.write(': connected\n\n');
          for (const [index, type] of ['error', 'turn.failed', 'turn.started', 'message.delta'].entries()) {
            const event = {seq: after + index + 1, type, turn_id: index < 2 ? 'previous' : 'next', payload: {text: '你好', error: {code: 'upstream', message: 'Failed'}}, created_at: '2026-09-29'};
            response.write(`id: ${event.seq}\nevent: ${type}\ndata: ${JSON.stringify(event)}\n\n`);
          }
          // Remain open like the real session stream; the browser must cancel it.
          return;
        }
        if (request.method === 'GET' && path === '/v1/zai/coding/agents/browser/status/stream') {
          response.setHeader('content-type', 'text/event-stream');
          response.write(': ping\n\n');
          for (const status of ['starting', 'ready']) response.write(`event: runner.status\ndata: ${JSON.stringify({agent_id: 'browser', status, reason: null})}\n\n`);
          response.end();
          return;
        }
        if (request.method === 'POST' && path === '/v1/zai/coding/sessions/browser/files') {
          const chunks: Uint8Array[] = [];
          for await (const chunk of request) chunks.push(chunk);
          const body = Buffer.concat(chunks);
          response.statusCode = 201;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({id: 'attachment-id', name: new URL(request.url!, 'http://test').searchParams.get('name'),
            size: body.length, status: 'ready', test_content: body.toString('utf8'), request_type: request.headers['content-type']}));
          return;
        }
        if (request.method !== 'POST' || (!/^\/v1\/zai\/sessions\/[^/]+\/files\/upload$/.test(path ?? '') && path !== '/v1/zai/files/extract')) {
          next();
          return;
        }
        // WebKit's intercepted postDataBuffer omits file contents. Read the
        // actual HTTP body here so all engines exercise real multipart upload.
        try {
          const chunks: Uint8Array[] = [];
          for await (const chunk of request) chunks.push(chunk);
          const form = await new Request(`http://127.0.0.1${request.url}`, {
            method: 'POST', headers: {'content-type': request.headers['content-type'] ?? ''},
            body: new Uint8Array(Buffer.concat(chunks)),
          }).formData();
          const file = form.get('file') as File;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify(path === '/v1/zai/files/extract' ? {
            content: await file.text(), metadata: {filename: file.name, hasPath: form.has('path')},
          } : {
            ...(form.has('path') ? {path: form.get('path')} : {id: 'attachment-id', status: 'ready'}), name: file.name, mime_type: file.type, size: file.size,
            test_content: await file.text(),
          }));
        } catch {
          response.statusCode = 400;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({error: 'Invalid multipart test upload.'}));
        }
      });
    },
  }],
});
