"use client";

import { useState, useCallback } from "react";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();

  const signMessage = useCallback(
    async (message: string) => {
      if (!address) {
        throw new Error("Please connect your wallet to sign a message.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      setIsLoading(true);
      setError(null);
      setSignature(null);

      try {
        // Create a transaction with just a memo to sign
        const msgs: never[] = [];
        const fee = {
          amount: [{ denom: "uatom", amount: "0" }],
          gas: "0",
        };

        // Sign without broadcasting
        const txRaw = await signingClient.sign(address, msgs, fee, message);

        // Extract the signature from the transaction
        const sig = bytesToBase64(txRaw.signatures[0]);
        setSignature(sig);
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
    isLoading: isLoading || isSignerLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}
