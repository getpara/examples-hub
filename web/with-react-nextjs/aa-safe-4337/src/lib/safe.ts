import { sepolia } from "viem/chains";

export const CHAIN = sepolia;
export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

if (!PIMLICO_API_KEY) {
  console.warn("NEXT_PUBLIC_PIMLICO_API_KEY is not set. Safe sponsored transactions will not work.");
}
