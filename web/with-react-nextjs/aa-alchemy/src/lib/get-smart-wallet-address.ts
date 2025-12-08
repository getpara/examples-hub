import type { ParaWeb as Para } from "@getpara/react-sdk";
import { generateSalt } from "./generate-salt";
import { createParaAlchemyClient } from "./create-alchemy-client";

const walletAddressCache = new Map<string, string>();

export async function getSmartWalletAddress(para: Para, walletId: string, index: number) {
  const cacheKey = `${walletId}:${index}`;
  if (walletAddressCache.has(cacheKey)) {
    const cachedAddress = walletAddressCache.get(cacheKey)!;
    return cachedAddress;
  }

  try {
    const salt = generateSalt(walletId, index);
    const client = await createParaAlchemyClient(para, salt);
    const address = client.account.address;

    walletAddressCache.set(cacheKey, address);

    return address;
  } catch (error) {
    console.error(`[getSmartWalletAddress] Error getting wallet address:`, error);
    throw error;
  }
}
