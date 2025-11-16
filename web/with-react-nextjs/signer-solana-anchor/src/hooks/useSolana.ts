import { Connection } from "@solana/web3.js";
import { DEVNET_RPC_URL } from "@/config/constants";

const connection = new Connection(DEVNET_RPC_URL, "confirmed");

export function useSolana() {
  return { connection };
}