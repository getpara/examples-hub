import { useState, useCallback } from "react";
import { useParaCosmWasmSigner } from "@/hooks/useParaCosmWasmSigner";
import { parseJsonMessage } from "@/lib/contractMessage";

export function useCosmWasmExecute() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaCosmWasmSigner();

  const executeContract = useCallback(
    async (contractAddress: string, executeMessage: string) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to execute contract.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        if (!contractAddress) {
          throw new Error("Please enter a contract address.");
        }

        const result = await signingClient.execute(
          address,
          contractAddress,
          parseJsonMessage(executeMessage, "execute"),
          "auto",
          "CosmWasm execution via Para + CosmJS"
        );

        setTxHash(result.transactionHash);
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
    setTxHash(null);
    setError(null);
  }, []);

  return {
    executeContract,
    txHash,
    isLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
