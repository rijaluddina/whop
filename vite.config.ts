import { whop } from '@whop/cli/vite'
import { existsSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig(({ mode }) => {
  if (existsSync('.dev.vars')) process.loadEnvFile('.dev.vars')
  const env = loadEnv(mode, process.cwd(), '')
  const whopEnvironment = process.env.WHOP_ENVIRONMENT ?? env.WHOP_ENVIRONMENT ?? 'production'
  if (whopEnvironment !== 'sandbox' && whopEnvironment !== 'production') {
    throw new Error('WHOP_ENVIRONMENT must be "sandbox" or "production"')
  }

  return {
    define: { 'import.meta.env.VITE_WHOP_ENVIRONMENT': JSON.stringify(whopEnvironment) },
    build: { sourcemap: true },
    resolve: { tsconfigPaths: true },
    plugins: [
      whop({ disableTanstackDevtools: true }),
      devtools(),
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})
