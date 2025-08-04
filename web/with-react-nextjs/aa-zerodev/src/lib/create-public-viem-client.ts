import { createPublicClient, http } from "viem";
import { CHAIN, PUBLIC_RPC } from "@/config/zerodev";

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(PUBLIC_RPC),
});
