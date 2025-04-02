import { DEVNET_RPC_URL } from "@/constants";
import { Connection } from "@solana/web3.js";

export const connection = new Connection(DEVNET_RPC_URL, "confirmed");
