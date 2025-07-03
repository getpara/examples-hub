import { Environment, Para } from "@getpara/server-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

export function getParaServerClient() {
  if (!API_KEY) {
    throw new Error("PARA_API_KEY is not defined in the environment variables");
  }
  
  return new Para(ENVIRONMENT, API_KEY);
}