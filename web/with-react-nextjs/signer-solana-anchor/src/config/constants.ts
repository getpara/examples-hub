import { Environment } from "@getpara/react-sdk-lite";
import { PublicKey } from "@solana/web3.js";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/";

export const PROGRAM_ID = new PublicKey("7aZTQdMeajFATgMKS7h7mGWVqh1UaRnWt1Pf8mnvBDkk");
