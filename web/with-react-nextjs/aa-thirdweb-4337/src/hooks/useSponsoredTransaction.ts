import { useCallback, useState } from "react";
import type { SmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export function useSponsoredTransaction(smartAccount: SmartAccount | null) {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const send = useCallback(async () => {
    if (!smartAccount) {
      setErrorMessage("Thirdweb smart account is not ready yet.");
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setTransactionHash(null);

    try {
      const receipt = await smartAccount.sendTransaction({ to: BURN_ADDRESS });
      setTransactionHash(receipt.transactionHash);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Thirdweb transaction failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  }, [smartAccount]);

  return {
    send,
    targetAddress: BURN_ADDRESS,
    transactionHash,
    errorMessage,
    isPending,
  };
}
