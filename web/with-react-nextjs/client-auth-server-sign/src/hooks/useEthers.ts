import { ethers } from "ethers";
import { SEPOLIA_RPC_URL } from "@/config";

// Create a single shared provider instance
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

export function useEthers() {
  return {
    provider,
  };
}