import { useCallback, useState } from "react";
import { useGelatoSmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { CHAIN, GELATO_API_KEY } from "@/lib/gelato";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

interface UseGelatoSponsoredTransactionOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Transaction failed. Please try again.");
}

export function useGelatoSponsoredTransaction({
  enabled = true,
}: UseGelatoSponsoredTransactionOptions = {}) {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const {
    smartAccount,
    isLoading: isSmartAccountLoading,
    error: smartAccountError,
  } = useGelatoSmartAccount({
    apiKey: GELATO_API_KEY,
    chain: CHAIN,
    enabled,
  });

  const sendSponsoredTransaction = useCallback(async () => {
    if (!smartAccount) {
      setTransactionError(new Error("Smart account is not ready yet."));
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
