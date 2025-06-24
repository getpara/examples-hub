import { createPublicClient, http } from "viem";
import { sepolia } from "@account-kit/infra";

const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC || "";

// Singleton public client instance
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
});