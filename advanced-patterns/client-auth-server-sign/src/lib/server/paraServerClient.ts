import { Environment, Para } from "@getpara/server-sdk";
import { PARA_API_KEY, PARA_ENVIRONMENT_NAME } from "@/lib/environment";

export function createParaServerClient(): Para {
  if (!PARA_API_KEY) {
    throw new Error("NEXT_PUBLIC_PARA_API_KEY is not set on the server");
  }

  return new Para(PARA_ENVIRONMENT_NAME as Environment, PARA_API_KEY);
}
