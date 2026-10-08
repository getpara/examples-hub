import { Environment, Para } from "@getpara/server-sdk";

export function createParaServerClient(): Para {
  if (!process.env.NEXT_PUBLIC_PARA_API_KEY) {
    throw new Error("NEXT_PUBLIC_PARA_API_KEY is not defined in the environment variables");
  }

  return new Para(
    (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) ?? Environment.BETA,
    process.env.NEXT_PUBLIC_PARA_API_KEY
  );
}
