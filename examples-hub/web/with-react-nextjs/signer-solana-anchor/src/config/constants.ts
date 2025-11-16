import { Environment } from "@getpara/react-sdk";
import { PublicKey } from "@solana/web3.js";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error(
    "API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables."
  );
}

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/";

export const PROGRAM_ID = new PublicKey("7aZTQdMeajFATgMKS7h7mGWVqh1UaRnWt1Pf8mnvBDkk");