import { sepolia } from "viem/chains";

export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";
export const SPONSORSHIP_POLICY_ID = process.env.NEXT_PUBLIC_PIMLICO_SPONSORSHIP_POLICY_ID ?? "";

export const CHAIN = sepolia;

// Use chain ID in URL for consistency with Pimlico's API format
export const PIMLICO_RPC_URL = `https://api.pimlico.io/v2/${CHAIN.id}/rpc?apikey=${PIMLICO_API_KEY}`;

if (!PIMLICO_API_KEY) {
  console.warn("NEXT_PUBLIC_PIMLICO_API_KEY is not set. Pimlico features will not work.");
}

if (!SPONSORSHIP_POLICY_ID) {
  console.warn("NEXT_PUBLIC_PIMLICO_SPONSORSHIP_POLICY_ID is not set. Gas sponsorship may not work.");
}
