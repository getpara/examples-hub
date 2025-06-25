import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEthers } from "./useEthers";
import { useClient } from "@getpara/react-sdk";
import { constructTransaction, validateTransaction, serializeTransaction } from "@/utils";

interface TransactionParams {
  from: string;
  to: string;
  amount: string;
  walletId: string;
}

interface TransactionResponse {
  transactionHash: string;
  response: any;
}

export function useServerTransaction() {
  const { provider } = useEthers();
  const para = useClient();
  const queryClient = useQueryClient();

  const mutation = useMutation<TransactionResponse, Error, TransactionParams>({
    mutationFn: async ({ from, to, amount, walletId }) => {
      // Validate transaction
      const validation = await validateTransaction(provider, from, to, amount);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Construct transaction
      const tx = await constructTransaction(provider, from, to, amount);
      console.log("Constructed transaction:", tx);

      // Export session
      const session = await para?.exportSession();
      if (!session) {
        throw new Error("Session not found. Please reconnect your wallet.");
      }

      // Send to server for signing
      const response = await fetch("/api/signing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          transaction: serializeTransaction(tx),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign and broadcast transaction");
      }

      const data = await response.json();
      console.log("Server response:", data);

      if (!data.transactionHash) {
        throw new Error("Transaction hash not found in server response");
      }

      // Wait for confirmation
      await provider.waitForTransaction(data.transactionHash, 1);

      return {
        transactionHash: data.transactionHash,
        response: data,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate balance query for the sender address
      queryClient.invalidateQueries({ queryKey: ["balance", variables.from] });
    },
  });

  return {
    sendTransaction: mutation.mutate,
    sendTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}