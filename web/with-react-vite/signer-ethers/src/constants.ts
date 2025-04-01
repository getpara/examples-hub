import { Environment } from "@getpara/react-sdk";

export const API_KEY = import.meta.env.VITE_PARA_API_KEY;
export const ENVIRONMENT =
  import.meta.env.VITE_PARA_ENVIRONMENT || Environment.BETA;

if (!API_KEY) {
  throw new Error(
    "API key is not defined. Please set VITE_PARA_API_KEY in your environment variables."
  );
}

export const HOLESKY_RPC_URL =
  process.env.NEXT_PUBLIC_HOLESKY_RPC_URL ||
  "https://ethereum-holesky-rpc.publicnode.com";
