import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;
export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY ?? "";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

if (!GELATO_API_KEY) {
  throw new Error("Gelato API key is not defined. Please set NEXT_PUBLIC_GELATO_API_KEY in your environment variables.");
}
