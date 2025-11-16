import { useMemo } from "react";
import { useSmartWallets } from "./useSmartWallets";
import { MAX_SMART_WALLETS_PER_EOA } from "@/config/smart-wallet";

export function useNextAvailableWalletIndex() {
  const { wallets, isError } = useSmartWallets();

  return useMemo(() => {
    if (!wallets || isError) return undefined;

    const deployedCount = wallets.filter((w) => w.isDeployed).length;

    if (deployedCount === MAX_SMART_WALLETS_PER_EOA) {
      return null;
    }

    const nextIndex = wallets.findIndex((w) => !w.isDeployed);

    if (nextIndex === -1 && wallets.length < MAX_SMART_WALLETS_PER_EOA) {
      return wallets.length;
    }

    return nextIndex;
  }, [wallets, isError]);
}
