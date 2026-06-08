"use client";

import { useState, useCallback } from "react";
import { Buffer } from "buffer";
import { StrKey } from "@stellar/stellar-sdk";
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
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsVerified(null);

      try {
        const normalizedMessage = message.trim();
        const messageBytes = Buffer.from(new TextEncoder().encode(normalizedMessage));
        const signedBytes = await signer.signBytes(messageBytes);
        setSignature(signedBytes.toString("hex"));
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
      if (!signer?.address || !signature) {
        setError(new Error("No signer or signature to verify"));
        return;
      }

      try {
        const messageBytes = new Uint8Array(new TextEncoder().encode(message.trim()));
        const signatureBytes = new Uint8Array(Buffer.from(signature, "hex"));
        const publicKeyBytes = StrKey.decodeEd25519PublicKey(signer.address);
        const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
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
