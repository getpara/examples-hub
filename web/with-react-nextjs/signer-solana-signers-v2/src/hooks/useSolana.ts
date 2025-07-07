import { createSolanaRpc } from "@solana/kit";
import { DEVNET_RPC_URL } from "@/config/constants";

// Create a single shared RPC client instance
const rpc = createSolanaRpc(DEVNET_RPC_URL);

export function useSolana() {
  return {
    rpc,
    rpcUrl: DEVNET_RPC_URL,
  };
}