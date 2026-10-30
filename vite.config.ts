import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { whop } from '@whop/cli/vite';
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
      // Find the entry point and rename it
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          // Delete the old entry and emit a new one with index.js name
          delete bundle[fileName];
          chunk.fileName = 'index.js';
          bundle['index.js'] = chunk;
          break;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), whop(), renameSsrEntry()],
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
