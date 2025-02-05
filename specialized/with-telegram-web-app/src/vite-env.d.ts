/// <reference types="vite/client" />

import { Environment } from "@getpara/web-sdk";

interface ImportMetaEnv {
  readonly VITE_PARA_ENV: Environment;
  readonly VITE_PARA_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
