import type { ParaWeb as Para } from "@getpara/react-sdk";
import { createParaViemAccount, predictSmartWalletAddress } from "./predict-smart-wallet-address";

const walletAddressCache = new Map<string, string>();
const paraAccountCache = new Map<string, ReturnType<typeof createParaViemAccount>>();

export async function getSmartWalletAddress(para: Para, walletId: string, index: number) {
  const cacheKey = `${walletId}:${index}`;
  if (walletAddressCache.has(cacheKey)) {
    const cachedAddress = walletAddressCache.get(cacheKey)!;
    return cachedAddress;
  }

  try {
    // Get or create the Para account (reuse for efficiency)
    let viemParaAccount = paraAccountCache.get(walletId);
    if (!viemParaAccount) {
      viemParaAccount = createParaViemAccount(para);
      paraAccountCache.set(walletId, viemParaAccount);
    }

    // Efficiently predict the address without connecting
    const address = await predictSmartWalletAddress(viemParaAccount, index);

    walletAddressCache.set(cacheKey, address);

    return address;
  } catch (error) {
    console.error(`[getSmartWalletAddress] Error getting wallet address:`, error);
    throw error;
  }
}
