import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [{
    name: 'zai-browser-upload-fixture',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'POST' || !/^\/v8\/sessions\/[^/]+\/files\/upload$/.test(request.url ?? '')) {
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
          response.end(JSON.stringify({
            path: form.get('path'), name: file.name, mime_type: file.type, size: file.size,
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
