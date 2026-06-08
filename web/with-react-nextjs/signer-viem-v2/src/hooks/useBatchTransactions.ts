"use client";

import { useCallback, useEffect, useState } from "react";
import { encodeFunctionData, formatEther, isAddress, parseEther, type Address, type Hex } from "viem";
import { PARA_TEST_TOKEN_ABI, PARA_TEST_TOKEN_ADDRESS } from "@/lib/contracts";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

export type Operation =
  | {
      type: "mint";
      recipient?: string;
      amount: string;
    }
  | {
      type: "transfer";
      recipient: string;
      amount: string;
    };

export function useBatchTransactions() {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const reset = () => {
    setTxHash(null);
    setError(null);
  };

  const fetchTokenData = useCallback(async () => {
    if (!address) {
      setTokenBalance(null);
      return;
    }

    try {
      setIsBalanceLoading(true);
      setError(null);
      const balance = await publicClient.readContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setTokenBalance(formatEther(balance as bigint));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch token data"));
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReady) {
      void fetchTokenData();
    }
  }, [isReady, fetchTokenData]);

  const executeMulticall = async (operations: Operation[]) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before executing a batch."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const callData = operations.map((operation) => {
        if (operation.type === "mint") {
          return encodeFunctionData({
            abi: PARA_TEST_TOKEN_ABI,
            functionName: "mint",
            args: [parseEther(operation.amount)],
          });
        }

        if (!isAddress(operation.recipient)) {
          throw new Error("Enter a valid recipient address for every transfer operation.");
        }

        return encodeFunctionData({
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "transfer",
          args: [operation.recipient as Address, parseEther(operation.amount)],
        });
      });

      const hash = await viemClient.writeContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        account,
        chain: CHAIN,
        functionName: "multicall",
        args: [callData],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      await fetchTokenData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to execute batch transaction"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeMulticall,
    fetchTokenData,
    tokenBalance,
    txHash,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  };
}
