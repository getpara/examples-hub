import { sepolia } from "viem/chains";

export const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY ?? "";
export const CHAIN = sepolia;

if (!GELATO_API_KEY) {
  console.warn("NEXT_PUBLIC_GELATO_API_KEY is not set. Gelato features will not work.");
}
