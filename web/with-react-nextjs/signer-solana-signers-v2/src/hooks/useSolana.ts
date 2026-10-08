import { createSolanaRpc } from "@solana/kit";
import { createHttpTransport } from "@solana/rpc-transport-http";
import { createSolanaRpcApi } from "@solana/rpc-api";
import { createRpc } from "@solana/rpc-spec";
import { SOLANA_DEVNET } from "@/lib/chain";

const kitRpc = createSolanaRpc(SOLANA_DEVNET.rpcUrl);

const paraRpc = createRpc({
  api: createSolanaRpcApi(),
  transport: createHttpTransport({ url: SOLANA_DEVNET.rpcUrl }),
});

export function useSolana() {
  return {
    rpc: kitRpc,
    paraRpc,
  };
}
