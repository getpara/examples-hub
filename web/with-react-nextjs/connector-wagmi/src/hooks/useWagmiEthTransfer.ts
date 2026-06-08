"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { parseEther } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { isValidAmount, isValidEthereumAddress } from "@/utils/validation";

interface UseWagmiEthTransferOptions {
  isConnected: boolean;
}

export function useWagmiEthTransfer({ isConnected }: UseWagmiEthTransferOptions) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    data: hash,
    error: sendError,
    isError: isSendError,
    isPending: isSending,
    sendTransaction,
  } = useSendTransaction();
  const {
    error: confirmError,
    isError: isConfirmError,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!isConnected) {
      setValidationError("Please connect your wallet to send a transaction.");
      return;
    }

    if (!isValidEthereumAddress(to)) {
      setValidationError("Invalid recipient address format.");
      return;
    }

    if (!isValidAmount(amount)) {
      setValidationError("Please enter a valid amount greater than 0.");
      return;
    }

    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
  };

  const isLoading = isSending || isConfirming;
  const error = validationError || sendError?.message || confirmError?.message || null;
  const isError = Boolean(validationError) || isSendError || isConfirmError;

  return {
    amount,
    hash,
    isLoading,
    setAmount,
    setTo,
    status: {
      message: isSending
        ? "Submitting transaction..."
        : isConfirming
          ? "Waiting for confirmation..."
          : isError
            ? error || "Failed to send transaction. Please try again."
            : "Transaction confirmed successfully.",
      show: isLoading || isError || isConfirmed,
      type: isLoading ? ("info" as const) : isError ? ("error" as const) : ("success" as const),
    },
    submit,
    to,
  };
}
