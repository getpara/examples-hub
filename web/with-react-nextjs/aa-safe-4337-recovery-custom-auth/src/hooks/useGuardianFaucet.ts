import { useCallback, useState } from "react";
import type ParaWeb from "@getpara/web-sdk";

export function useGuardianFaucet(para: ParaWeb | null, walletId: string | null) {
  const [isPending, setIsPending] = useState(false);

  const requestFunds = useCallback(async () => {
    if (!para || !walletId) {
      throw new Error("Connect the Para guardian wallet before requesting funds.");
    }

    setIsPending(true);
    try {
      const response = await para.requestFaucet({ walletId, chain: "ETHEREUM_SEPOLIA" });
      return response.transactionHash;
    } finally {
      setIsPending(false);
    }
  }, [para, walletId]);

  return { requestFunds, isPending };
}
