/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PARA_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
