import type { Environment } from "@getpara/react-sdk";

export const API_KEY = import.meta.env.VITE_PARA_API_KEY;
export const ENVIRONMENT = import.meta.env.VITE_PARA_ENVIRONMENT as Environment;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}
