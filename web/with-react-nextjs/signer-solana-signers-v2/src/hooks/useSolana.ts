import { createSolanaRpc } from "@solana/kit";
import { createHttpTransport } from '@solana/rpc-transport-http';
import { createSolanaRpcApi } from '@solana/rpc-api';
import { createRpc } from '@solana/rpc-spec';
import { DEVNET_RPC_URL } from "@/config/constants";

// Create RPC client for @solana/kit usage
const kitRpc = createSolanaRpc(DEVNET_RPC_URL);

// Create RPC client for Para signer (uses @solana/rpc-spec)
const transport = createHttpTransport({ url: DEVNET_RPC_URL });
const api = createSolanaRpcApi();
const paraRpc = createRpc({ api, transport });

export function useSolana() {
  return {
    rpc: kitRpc, // For general usage (transaction utilities)
    paraRpc: paraRpc, // For Para signer
    rpcUrl: DEVNET_RPC_URL,
  };
}