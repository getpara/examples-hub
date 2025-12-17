import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { SEPOLIA_RPC_URL } from "@/config/constants";

export const CHAIN = sepolia;

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(SEPOLIA_RPC_URL),
});
