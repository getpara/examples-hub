"use client";

import { useCallback, useState } from "react";
import { Buffer } from "buffer";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const { signer, isReady } = useParaSigner();
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const signMessage = useCallback(
    async (message: string) => {
      if (!signer || !isReady) {
        setError(new Error("Signer not ready. Please connect your wallet."));
        return;
      }

      if (!message.trim()) {
        setError(new Error("Please enter a message to sign."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setSignature(null);
      setIsVerified(null);

      try {
        const messageBytes = new TextEncoder().encode(message.trim());
        const signedBytes = await signer.signBytes(Buffer.from(messageBytes));
        setSignature(bs58.encode(signedBytes));
      } catch (err) {
        console.error("Error signing message:", err);
        setError(err instanceof Error ? err : new Error("Failed to sign message"));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, isReady]
  );

  const verifySignature = useCallback(
    async (message: string) => {
      if (!signer?.sender || !signature) {
        setError(new Error("No signer or signature to verify."));
        return;
      }

      try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBuffer = signer.sender.toBytes();
        const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBuffer);
        setIsVerified(isValid);
      } catch (err) {
        console.error("Error verifying signature:", err);
        setError(err instanceof Error ? err : new Error("Failed to verify signature"));
        setIsVerified(false);
      }
    },
    [signer, signature]
  );

  const reset = useCallback(() => {
    setSignature(null);
    setError(null);
    setIsVerified(null);
  }, []);

  return {
    signMessage,
    verifySignature,
    signature,
    isLoading,
    error,
    isReady,
    isVerified,
    reset,
  };
}
