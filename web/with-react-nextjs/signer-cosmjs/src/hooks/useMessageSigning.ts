import { useState, useCallback } from "react";
import { toBase64 } from "@cosmjs/encoding";
import { useParaSigner } from "@/hooks/useParaSigner";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

export function useMessageSigning() {
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaSigner();

  const signMessage = useCallback(
    async (message: string) => {
      setIsLoading(true);
      setError(null);
      setSignature(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to sign a message.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        const fee = {
          amount: [{ denom: ICS_PROVIDER_TESTNET.denom, amount: "0" }],
          gas: "0",
        };

        const txRaw = await signingClient.sign(address, [], fee, message);
        setSignature(toBase64(txRaw.signatures[0]));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to sign message");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address]
  );

  const reset = useCallback(() => {
    setSignature(null);
    setError(null);
  }, []);

  return {
    signMessage,
    signature,
    address,
    isLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
