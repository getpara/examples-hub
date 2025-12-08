import { useMemo } from "react";
import { useSmartWallets } from "./useSmartWallets";

export function useNextAvailableWalletIndex() {
  const { wallets, isError } = useSmartWallets();

  return useMemo(() => {
    if (!wallets || isError) return undefined;

    const deployedCount = wallets.filter((w) => w.isDeployed).length;

    if (deployedCount === 3) {
      return null;
    }

    const nextIndex = wallets.findIndex((w) => !w.isDeployed);

    if (nextIndex === -1 && wallets.length < 3) {
      return wallets.length;
    }

    return nextIndex;
  }, [wallets, isError]);
}
