"use client";

import { useState } from "react";
import { verifyMessage, type Hex } from "viem";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [signature, setSignature] = useState<Hex | null>(null);
  const [recoveredAddress, setRecoveredAddress] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setSignature(null);
    setRecoveredAddress(null);
    setError(null);
  };

  const signMessage = async (message: string) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before signing."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const sig = await viemClient.signMessage({ account, message });
      setSignature(sig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign message"));
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignature = async (message: string, sig: Hex) => {
    if (!address) {
      setError(new Error("Connect your Para wallet before verifying."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const isValid = await verifyMessage({
        address,
        message,
        signature: sig,
      });
      setRecoveredAddress(isValid ? address : "Signature does not match the connected wallet");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to verify signature"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signMessage,
    verifySignature,
    signature,
    recoveredAddress,
    isLoading,
    isReady,
    error,
    reset,
  };
}
