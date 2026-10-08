import { useState, useCallback } from "react";
import { coins } from "@cosmjs/stargate";
import { useParaSigner } from "@/hooks/useParaSigner";
import { ICS_PROVIDER_TESTNET, toMinimalDenom } from "@/lib/chain";

export function useAtomTransfer() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaSigner();

  const sendTokens = useCallback(
    async (recipient: string, amount: string) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to send a transaction.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        if (!recipient.startsWith("cosmos")) {
          throw new Error("Invalid recipient address. Must start with 'cosmos'.");
        }

        const amountInMinimalDenom = toMinimalDenom(amount);
        if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
          throw new Error("Invalid amount. Please enter a valid positive number.");
        }

        const result = await signingClient.sendTokens(
          address,
          recipient,
          coins(amountInMinimalDenom, ICS_PROVIDER_TESTNET.denom),
          "auto",
          "Sent via Para + CosmJS"
        );

        setTxHash(result.transactionHash);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send transaction");
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
    sendTokens,
    txHash,
    isLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
