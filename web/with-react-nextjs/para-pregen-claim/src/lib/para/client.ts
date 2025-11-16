import { Environment, Para } from "@getpara/server-sdk";

let paraClient: Para | null = null;

export function getParaClient(): Para {
  if (!paraClient) {
    if (!process.env.NEXT_PUBLIC_PARA_API_KEY) {
      throw new Error("NEXT_PUBLIC_PARA_API_KEY is not defined in the environment variables");
    }

    paraClient = new Para(
      (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) ?? Environment.BETA,
      process.env.NEXT_PUBLIC_PARA_API_KEY
    );
  }

  return paraClient;
}