import { useCallback, useState } from "react";
import { useZeroDevSmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { CHAIN, ZERODEV_PROJECT_ID } from "@/lib/zerodev";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

interface UseZeroDevSponsoredTransactionOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Transaction failed. Please try again.");
}

export function useZeroDevSponsoredTransaction({
  enabled = true,
}: UseZeroDevSponsoredTransactionOptions = {}) {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const {
    smartAccount,
    isLoading: isSmartAccountLoading,
    error: smartAccountError,
  } = useZeroDevSmartAccount({
    projectId: ZERODEV_PROJECT_ID,
    chain: CHAIN,
    enabled,
  });

  const sendSponsoredTransaction = useCallback(async () => {
    if (!smartAccount) {
      setTransactionError(new Error("ZeroDev smart account is not ready yet."));
      return;
    }

    setIsSendingTransaction(true);
    setTransactionError(null);
    setTransactionHash(null);

    try {
      const receipt = await smartAccount.sendTransaction({ to: BURN_ADDRESS });
      setTransactionHash(receipt.transactionHash);
    } catch (error) {
      setTransactionError(toError(error));
    } finally {
      setIsSendingTransaction(false);
    }
  }, [smartAccount]);

  return {
    smartAccountAddress: smartAccount?.smartAccountAddress ?? null,
    targetAddress: BURN_ADDRESS,
    transactionHash,
    smartAccountError,
    transactionError,
    isSmartAccountLoading,
    isSendingTransaction,
    canSendTransaction: enabled && Boolean(smartAccount) && !isSendingTransaction,
    sendSponsoredTransaction,
  };
}
