import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaZeroDevClient } from "./create-zerodev-client";

const walletAddressCache = new Map<string, string>();

export async function getSmartWalletAddress(para: Para, walletId: string, index: number) {
  const cacheKey = `${walletId}:${index}`;
  if (walletAddressCache.has(cacheKey)) {
    const cachedAddress = walletAddressCache.get(cacheKey)!;
    return cachedAddress;
  }

  try {
    const { address } = await createParaZeroDevClient(para, BigInt(index));

    walletAddressCache.set(cacheKey, address);

    return address;
  } catch (error) {
    console.error(`[getSmartWalletAddress] Error getting wallet address:`, error);
    throw error;
  }
}
