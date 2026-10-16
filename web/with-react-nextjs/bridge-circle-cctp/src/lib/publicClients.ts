import { createPublicClient, http } from "viem";
import { ARC, BASE } from "@/lib/chain";

export const basePublicClient = createPublicClient({
  chain: BASE.chain,
  transport: http(BASE.rpcUrl),
});

export const arcPublicClient = createPublicClient({
  chain: ARC.chain,
  transport: http(ARC.rpcUrl),
});
