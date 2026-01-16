import { Para, Environment } from "@getpara/server-sdk";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

export function getParaServerClient() {
  if (!API_KEY) {
    throw new Error("PARA_API_KEY is not defined in the environment variables");
  }

  return new Para(ENVIRONMENT, API_KEY);
}
