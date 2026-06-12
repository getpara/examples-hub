import { useCallback, useState } from "react";
import { useSafeSmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { CHAIN, PIMLICO_API_KEY, SEPOLIA_RPC_URL } from "@/lib/safe";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

interface UseSafeSponsoredTransactionOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Transaction failed. Please try again.");
}

export function useSafeSponsoredTransaction({
  enabled = true,
}: UseSafeSponsoredTransactionOptions = {}) {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const {
    smartAccount,
    isLoading: isSmartAccountLoading,
    error: smartAccountError,
  } = useSafeSmartAccount({
    pimlicoApiKey: PIMLICO_API_KEY,
    chain: CHAIN,
    rpcUrl: SEPOLIA_RPC_URL,
    enabled: enabled && Boolean(PIMLICO_API_KEY),
  });
  const missingPimlicoError =
    enabled && !PIMLICO_API_KEY ? new Error("NEXT_PUBLIC_PIMLICO_API_KEY is required.") : null;

  const sendSponsoredTransaction = useCallback(async () => {
    if (!smartAccount) {
      setTransactionError(new Error("Safe smart account is not ready yet."));
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
    smartAccountError: missingPimlicoError ?? smartAccountError,
    transactionError,
    isSmartAccountLoading,
    isSendingTransaction,
    canSendTransaction: enabled && Boolean(smartAccount) && !isSendingTransaction,
    sendSponsoredTransaction,
  };
}
