import { useCallback, useState } from "react";
import { useAlchemySmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { ALCHEMY_API_KEY, CHAIN, GAS_POLICY_ID } from "@/lib/alchemy";

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

interface UseAlchemy7702SponsoredTransactionOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Transaction failed. Please try again.");
}

export function useAlchemy7702SponsoredTransaction({
  enabled = true,
}: UseAlchemy7702SponsoredTransactionOptions = {}) {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const {
    smartAccount,
    isLoading: isAccountLoading,
    error: accountError,
  } = useAlchemySmartAccount({
    apiKey: ALCHEMY_API_KEY,
    chain: CHAIN,
    gasPolicyId: GAS_POLICY_ID,
    mode: "7702",
    enabled,
  });

  const sendSponsoredTransaction = useCallback(async () => {
    if (!smartAccount) {
      setTransactionError(new Error("EIP-7702 account is not ready yet."));
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
    delegatedAccountAddress: smartAccount?.smartAccountAddress ?? null,
    targetAddress: BURN_ADDRESS,
    transactionHash,
    accountError,
    transactionError,
    isAccountLoading,
    isSendingTransaction,
    canSendTransaction: enabled && Boolean(smartAccount) && !isSendingTransaction,
    sendSponsoredTransaction,
  };
}
