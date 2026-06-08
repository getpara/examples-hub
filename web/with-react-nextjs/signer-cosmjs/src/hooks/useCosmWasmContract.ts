"use client";

import { useState, useCallback } from "react";
import { CosmWasmClient } from "@cosmjs/cosmwasm";
import { useParaCosmWasmSigner } from "./useParaCosmWasmSigner";
import { DEFAULT_CHAIN } from "@/config/chains";

export function useCosmWasmContract() {
  const [queryResult, setQueryResult] = useState<unknown | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaCosmWasmSigner();

  const queryContract = useCallback(
    async (contractAddress: string, msg: object) => {
      if (!contractAddress) {
        throw new Error("Please enter a contract address.");
      }

      setIsLoading(true);
      setError(null);
      setQueryResult(null);

      try {
        const client = await CosmWasmClient.connect(DEFAULT_CHAIN.rpc);
        const result = await client.queryContractSmart(contractAddress, msg);
        setQueryResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to query contract");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const executeContract = useCallback(
    async (contractAddress: string, msg: object, funds?: { denom: string; amount: string }[]) => {
      if (!address) {
        throw new Error("Please connect your wallet to execute contract.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!contractAddress) {
        throw new Error("Please enter a contract address.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setGasUsed(null);

      try {
        const result = await signingClient.execute(
          address,
          contractAddress,
          msg,
          "auto",
          "CosmWasm execution via Para + CosmJS",
          funds
        );

        setTxHash(result.transactionHash);
        setGasUsed(result.gasUsed);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to execute contract");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address]
  );

  const reset = useCallback(() => {
    setQueryResult(null);
    setTxHash(null);
    setGasUsed(null);
    setError(null);
  }, []);

  return {
    // Actions
    queryContract,
    executeContract,

    // Results
    queryResult,
    txHash,
    gasUsed,

    // Loading states
    isLoading: isLoading || isSignerLoading,
    isReady: !!signingClient && !!address,

    // Error and reset
    error,
    reset,
  };
}
