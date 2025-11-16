/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARA_API_KEY: string
  readonly VITE_PARA_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}