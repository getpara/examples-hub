import { useState, useCallback } from "react";
import { CosmWasmClient } from "@cosmjs/cosmwasm";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";
import { parseJsonMessage } from "@/lib/contractMessage";

export function useCosmWasmQuery() {
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryContract = useCallback(async (contractAddress: string, queryMessage: string) => {
    setIsLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      if (!contractAddress) {
        throw new Error("Please enter a contract address.");
      }

      const client = await CosmWasmClient.connect(ICS_PROVIDER_TESTNET.rpcUrl);
      const result = await client.queryContractSmart(contractAddress, parseJsonMessage(queryMessage, "query"));
      setQueryResult(JSON.stringify(result, null, 2));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to query contract");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQueryResult(null);
    setError(null);
  }, []);

  return { queryContract, queryResult, isLoading, error, reset };
}
