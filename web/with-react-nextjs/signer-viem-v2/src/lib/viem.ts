import { createPublicClient, http } from "viem";
import { holesky } from "viem/chains";
import { HOLESKY_RPC_URL } from "@/config/constants";

export const CHAIN = holesky;

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(HOLESKY_RPC_URL),
});
