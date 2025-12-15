/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_ENV?: string;
  readonly VITE_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_STAGING_BASE_URL?: string;
  readonly VITE_API_PROD_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID_ADMIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

