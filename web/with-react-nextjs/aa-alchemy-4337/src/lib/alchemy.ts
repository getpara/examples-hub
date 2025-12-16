import { sepolia } from "viem/chains";

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";
export const ALCHEMY_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
export const GAS_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID ?? "";

export const CHAIN = sepolia;

if (!ALCHEMY_API_KEY) {
  console.warn("NEXT_PUBLIC_ALCHEMY_API_KEY is not set. Alchemy features will not work.");
}

if (!GAS_POLICY_ID) {
  console.warn("NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID is not set. Gas sponsorship will not work.");
}
