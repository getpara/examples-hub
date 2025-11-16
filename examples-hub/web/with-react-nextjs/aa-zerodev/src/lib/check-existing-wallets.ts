import type { ParaWeb as Para } from "@getpara/react-sdk";
import { publicClient } from "./create-public-viem-client";
import { getSmartWalletAddress } from "./get-smart-wallet-address";
import { MAX_SMART_WALLETS_PER_EOA } from "@/config/smart-wallet";

export async function checkExistingWallets(para: Para, walletId: string) {
  const wallets = [];

  try {
    for (let index = 0; index < MAX_SMART_WALLETS_PER_EOA; index++) {
      try {
        const address = await getSmartWalletAddress(para, walletId, index);

        const code = await publicClient.getCode({ address: address as `0x${string}` });
        const isDeployed = code && code !== "0x";

        wallets.push({
          address,
          index,
          isDeployed,
        });
      } catch (error) {
        console.error(`[checkExistingWallets] Error checking wallet at index ${index}:`, error);
        wallets.push({
          address: "",
          index,
          isDeployed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    return wallets;
  } catch (error) {
    console.error(`[checkExistingWallets] Fatal error checking wallets:`, error);
    throw error;
  }
}
