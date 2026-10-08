import { Connection } from "@solana/web3.js";
import { SOLANA_DEVNET } from "@/lib/chain";

const connection = new Connection(SOLANA_DEVNET.rpcUrl, "confirmed");

export function useSolanaConnection() {
  return {
    connection,
  };
}
