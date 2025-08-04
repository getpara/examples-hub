import type { ParaWeb as Para } from "@getpara/react-sdk";
import { getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";
import { MAX_SMART_WALLETS_PER_EOA } from "@/config/smart-wallet";
import { CHAIN } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { predictSmartWalletAddress } from "./predict-smart-wallet-address";
import { createParaAccount } from "@getpara/viem-v2-integration";

export async function checkExistingWallets(para: Para) {
  try {
    const viemParaAccount = createParaAccount(para);

    const promises = Array.from({ length: MAX_SMART_WALLETS_PER_EOA }, async (_, index) => {
      try {
        const address = await predictSmartWalletAddress(viemParaAccount, index);

        const contract = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address,
        });
        const isDeployed = await isContractDeployed(contract);

        return {
          address,
          index,
          isDeployed,
        };
      } catch (error) {
        console.error(`[checkExistingWallets] Error checking wallet at index ${index}:`, error);
        return {
          address: "",
          index,
          isDeployed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error(`[checkExistingWallets] Fatal error checking wallets:`, error);
    throw error;
  }
}
