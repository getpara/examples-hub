import { useMemo } from "react";
import { ethers } from "ethers";
import { SEPOLIA } from "@/lib/chain";

export function useEthersProvider() {
  const provider = useMemo(() => {
    return new ethers.JsonRpcProvider(SEPOLIA.rpcUrl);
  }, []);

  return {
    provider,
  };
}
