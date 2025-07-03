import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.VITE_PARA_API_KEY || "";
export const ENVIRONMENT = (process.env.VITE_PARA_ENVIRONMENT || Environment.BETA) as Environment;

if (!API_KEY) {
  console.warn("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}