/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WHOP_API_KEY: string;
  readonly WHOP_ACCOUNT_ID: string;
  readonly WHOP_FLAT_RATE_PRODUCT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
