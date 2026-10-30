/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WHOP_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
