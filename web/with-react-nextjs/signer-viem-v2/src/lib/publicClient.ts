import { createPublicClient, http } from "viem";
import { HOLESKY } from "@/lib/chain";

export const publicClient = createPublicClient({
  chain: HOLESKY.chain,
  transport: http(HOLESKY.rpcUrl),
});
