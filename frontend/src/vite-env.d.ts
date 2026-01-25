/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_BRAND_NAME: string;
  readonly VITE_BRAND_LOGO_URL: string;
  readonly VITE_BRAND_PRIMARY_COLOR: string;
  readonly VITE_BRAND_FOOTER_TEXT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
