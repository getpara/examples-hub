import type { ParaWeb as Para } from "@getpara/react-sdk";
import { getGelatoClient } from "./create-gelato-client";

// Note: We can remove this cache since getGelatoClient already caches the client
// which includes the address. This eliminates dual caching.
export async function getSmartWalletAddress(para: Para, walletId: string, index: number) {
  try {
    const { address } = await getGelatoClient(para, BigInt(index));
    return address;
  } catch (error) {
    console.error(`[getSmartWalletAddress] Error getting wallet address:`, error);
    throw error;
  }
}
