import ParaWeb, { Environment } from "@getpara/web-sdk";

export const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const PARA_ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment | undefined) ?? Environment.BETA;

export function createParaClient() {
  return new ParaWeb(PARA_ENVIRONMENT, PARA_API_KEY);
}
