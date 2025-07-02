import { Environment } from "@getpara/react-sdk";

// @ts-ignore - Vite provides import.meta.env
export const API_KEY = import.meta.env.VITE_PARA_API_KEY || "";
// @ts-ignore - Vite provides import.meta.env
export const ENVIRONMENT = (import.meta.env.VITE_PARA_ENVIRONMENT || Environment.BETA) as Environment;

if (!API_KEY) {
  console.warn("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}