import { Environment } from "@getpara/react-sdk-lite";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const TESTNET_EXPLORER_URL = "https://stellar.expert/explorer/testnet/tx";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
