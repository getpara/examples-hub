"use client";

import { useState, useCallback } from "react";
import { getUtf8Encoder } from "@solana/codecs-strings";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const { signer, isReady } = useParaSigner();

  const [signature, setSignature] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signMessage = useCallback(
    async (message: string) => {
      if (!signer || !isReady) {
        setError(new Error("Signer not initialized. Please connect your wallet."));
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
        const messageBytes = new Uint8Array(getUtf8Encoder().encode(message.trim()));
        const signatureResult = await signer.signMessages([{ content: messageBytes, signatures: {} }]);
        const signatureBytes = signatureResult[0][signer.address];
        const signatureBase58 = bs58.encode(signatureBytes);

        setSignature(signatureBase58);
      } catch (err) {
        console.error("Error signing message:", err);
        setError(err instanceof Error ? err : new Error("Failed to sign message. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, isReady]
  );

  const verifySignature = useCallback(
    async (message: string, sig: string) => {
      if (!signer || !message || !sig) {
        setError(new Error("Missing message, signature, or signer."));
        return;
      }

      try {
        const messageBytes = new Uint8Array(getUtf8Encoder().encode(message));
        const signatureBytes = bs58.decode(sig);
        const publicKeyBuffer = signer.sender;

        const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBuffer);
        setIsVerified(isValid);
      } catch (err) {
        console.error("Error verifying signature:", err);
        setError(err instanceof Error ? err : new Error("Failed to verify signature."));
        setIsVerified(false);
      }
    },
    [signer]
  );

  const reset = useCallback(() => {
    setSignature(null);
    setIsVerified(null);
    setError(null);
  }, []);

  return {
    signMessage,
    verifySignature,
    signature,
    isVerified,
    isLoading,
    isReady,
    error,
    reset,
  };
}
