import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { whop } from '@whop/cli/vite';
import { cloudflare } from '@cloudflare/vite-plugin'; // Required by Whop CLI
import { resolve } from 'path';
import type { Plugin } from 'vite';

// Plugin to rename SSR entry point to index.js
function renameSsrEntry(): Plugin {
  return {
    name: 'rename-ssr-entry',
    apply: 'build',
    generateBundle(
      _options: { entryFileNames?: string },
      bundle: Record<string, { type?: string; isEntry?: boolean; fileName?: string }>
    ) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          delete bundle[fileName];
          chunk.fileName = 'index.js';
          bundle['index.js'] = chunk;
          break;
        }
      }
    },
  };
}

// Dev server middleware to route /api/* and /admin/invoices directly to src/entry-server.ts
function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-middleware',
    apply: 'serve',
    configureServer(server) {
      const envVars = loadEnv(server.config.mode, process.cwd(), '');

      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';
        if (!urlStr.startsWith('/api/') && !urlStr.startsWith('/admin/invoices')) {
          return next();
        }

        try {
          const { default: worker } = await server.ssrLoadModule('/src/entry-server.ts');

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const body =
            chunks.length > 0 && req.method !== 'GET' && req.method !== 'HEAD'
              ? Buffer.concat(chunks)
              : undefined;

          const fullUrl = new URL(urlStr, `http://${req.headers.host || 'localhost:5173'}`);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
          }

          const webReq = new Request(fullUrl.toString(), {
            method: req.method,
            headers,
            body,
            // @ts-expect-error duplex required for request with body in Node fetch
            duplex: body ? 'half' : undefined,
          });

          const env = {
            APEX_WHOP_API_KEY: envVars.APEX_WHOP_API_KEY,
            APEX_WHOP_ACCOUNT_ID: envVars.APEX_WHOP_ACCOUNT_ID,
            APEX_WHOP_ENVIRONMENT: envVars.APEX_WHOP_ENVIRONMENT || 'sandbox',
            APEX_WHOP_FINAL_BALANCE_PLAN_ID: envVars.APEX_WHOP_FINAL_BALANCE_PLAN_ID,
            APEX_INVOICE_ADMIN_TOKEN: envVars.APEX_INVOICE_ADMIN_TOKEN,
            ASSETS: {
              fetch: async () => new Response('Not found', { status: 404 }),
            },
          };

          const webRes = await worker.fetch(webReq, env);
          res.statusCode = webRes.status;
          webRes.headers.forEach((val: string, key: string) => {
            res.setHeader(key, val);
          });
          const arrayBuffer = await webRes.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err) {
          console.error('[dev-api] Error handling request:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), whop(), devApiPlugin(), renameSsrEntry()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        client: resolve(__dirname, 'index.html'),
      },
    },
  },
  ssr: {
    noExternal: ['@whop/sdk'],
    resolve: {
      conditions: ['module', 'import'],
    },
  },
});
