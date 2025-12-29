"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const [signature, setSignature] = useState<string | null>(null);
  const [recoveredAddress, setRecoveredAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signer } = useParaSigner();

  const signMessage = useCallback(
    async (message: string) => {
      if (!signer) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      if (!message.trim()) {
        throw new Error("Please enter a message to sign.");
      }

      setIsLoading(true);
      setError(null);
      setSignature(null);
      setRecoveredAddress(null);

      try {
        const sig = await signer.signMessage(message.trim());
        setSignature(sig);
        return sig;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to sign message");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer]
  );

  const verifySignature = useCallback(
    async (message: string, sig: string) => {
      if (!message || !sig) {
        throw new Error("Message and signature are required for verification.");
      }

      try {
        const recovered = ethers.utils.verifyMessage(message, sig);
        setRecoveredAddress(recovered);
        return recovered;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to verify signature");
        setError(error);
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setSignature(null);
    setRecoveredAddress(null);
    setError(null);
  }, []);

  return {
    signMessage,
    verifySignature,
    signature,
    recoveredAddress,
    isLoading,
    isReady: !!signer,
    error,
    reset,
  };
}
