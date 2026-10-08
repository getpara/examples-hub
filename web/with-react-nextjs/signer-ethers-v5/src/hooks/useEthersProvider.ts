import { useMemo } from "react";
import { ethers } from "ethers";
import { HOLESKY } from "@/lib/chain";

export function useEthersProvider() {
  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(HOLESKY.rpcUrl);
  }, []);

  return {
    provider,
  };
}
