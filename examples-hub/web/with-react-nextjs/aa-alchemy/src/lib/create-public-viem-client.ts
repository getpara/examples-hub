import { createPublicClient, http } from "viem";
import { sepolia } from "@account-kit/infra";
import { ALCHEMY_RPC_URL } from "@/config/alchemy";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
});
