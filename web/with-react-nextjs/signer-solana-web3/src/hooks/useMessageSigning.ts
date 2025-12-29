"use client";

import { useState, useCallback } from "react";
import { getBase58Decoder, getBase58Encoder, getUtf8Encoder } from "@solana/kit";
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
        const messageBytes = getUtf8Encoder().encode(message.trim());
        const signedBytes = await signer.signBytes(Buffer.from(messageBytes));
        const sig = getBase58Decoder().decode(signedBytes);
        setSignature(`${sig}`);
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
        setError(new Error("No signer or signature to verify"));
        return;
      }

      try {
        const messageBytes = new Uint8Array(getUtf8Encoder().encode(message));
        const signatureBytes = new Uint8Array(getBase58Encoder().encode(signature));
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
