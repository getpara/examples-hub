import { Environment } from "@getpara/react-sdk-lite";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;
export const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";
