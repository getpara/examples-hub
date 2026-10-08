import { Environment, Para } from "@getpara/server-sdk";

export function createParaServerClient(): Para {
  const apiKey = process.env.NEXT_PUBLIC_PARA_API_KEY;

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_PARA_API_KEY is not set");
  }

  return new Para((process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA, apiKey);
}
