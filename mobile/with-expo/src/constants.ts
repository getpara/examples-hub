import type { Environment } from "@getpara/react-native-wallet";

export const APP_SCHEME = "para-expo";

const apiKey = process.env.EXPO_PUBLIC_PARA_API_KEY;
const environment = process.env.EXPO_PUBLIC_PARA_ENVIRONMENT as Environment;

if (!apiKey) {
  throw new Error("EXPO_PUBLIC_PARA_API_KEY is not defined in the environment variables.");
}

if (!environment) {
  throw new Error("EXPO_PUBLIC_PARA_ENVIRONMENT is not defined in the environment variables.");
}

export const PARA_API_KEY = apiKey;
export const PARA_ENVIRONMENT = environment;
export const ALCHEMY_SOLANA_RPC_URL = process.env.EXPO_PUBLIC_ALCHEMY_SOLANA_RPC_URL;
export const ALCHEMY_ETHEREUM_RPC_URL = process.env.EXPO_PUBLIC_ALCHEMY_ETHEREUM_RPC_URL;
