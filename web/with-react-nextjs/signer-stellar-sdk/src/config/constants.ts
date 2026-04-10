import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT = Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const TESTNET_EXPLORER_URL = "https://stellar.expert/explorer/testnet/tx";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
