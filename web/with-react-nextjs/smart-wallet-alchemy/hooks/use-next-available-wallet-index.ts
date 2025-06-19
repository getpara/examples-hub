import { useMemo } from "react";
import { useSmartWallets } from "./use-smart-wallets";

export function useNextAvailableWalletIndex() {
  const { data: wallets, isError } = useSmartWallets();
  
  return useMemo(() => {
    // Return undefined while loading or on error
    if (!wallets || isError) return undefined;
    
    // Count deployed wallets
    const deployedCount = wallets.filter(w => w.isDeployed).length;
    
    // If all 3 wallets are deployed, return null (limit reached)
    if (deployedCount === 3) {
      return null;
    }
    
    // Find first non-deployed index
    const nextIndex = wallets.findIndex(w => !w.isDeployed);
    
    // If all checked wallets are deployed but less than 3 total, return next index
    if (nextIndex === -1 && wallets.length < 3) {
      return wallets.length;
    }
    
    // Return the first available index
    return nextIndex;
  }, [wallets, isError]);
}