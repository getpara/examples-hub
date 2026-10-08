import { Environment, ParaWeb } from "@getpara/react-sdk";
import { chromeStorageOverrides } from "@/lib/chromeStorage";

const API_KEY = import.meta.env.VITE_PARA_API_KEY ?? "";
const ENVIRONMENT = (import.meta.env.VITE_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}

export const para = new ParaWeb(ENVIRONMENT, API_KEY, {
  ...chromeStorageOverrides,
  useStorageOverrides: true,
});

export const paraReady = para.init();
