"use client";

import { useState, useCallback } from "react";
import { getBase58Encoder, getUtf8Encoder, getBase58Decoder } from "@solana/kit";
import nacl from "tweetnacl";
import { useParaSigner } from "./useParaSigner";

export function useMessageSigning() {
  const { signer, anchorProvider, isReady } = useParaSigner();

  const [signature, setSignature] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signMessage = useCallback(
    async (message: string) => {
      if (!signer || !anchorProvider) {
        setError(new Error("Signer not initialized. Please connect your wallet."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setSignature(null);
      setIsVerified(null);

      try {
        const messageToSign = message.trim();
        const messageBytes = getUtf8Encoder().encode(messageToSign);
        const signedBytes = await signer.signBytes(Buffer.from(messageBytes));
        const sig = getBase58Decoder().decode(signedBytes);

        setSignature(sig);
      } catch (err) {
        console.error("Error signing message:", err);
        setError(err instanceof Error ? err : new Error("Failed to sign message"));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, anchorProvider]
  );

  const verifySignature = useCallback(
    async (message: string, sig: string) => {
      if (!anchorProvider) {
        setError(new Error("Provider not initialized."));
        return;
      }

      try {
        const messageBytes = new Uint8Array(getUtf8Encoder().encode(message));
        const signatureBytes = new Uint8Array(getBase58Encoder().encode(sig));
        const publicKeyBuffer = anchorProvider.wallet.publicKey.toBytes();
        const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBuffer);

        setIsVerified(isValid);
        if (!isValid) {
          setError(new Error("Invalid signature for this message and public key."));
        }
      } catch (err) {
        console.error("Error verifying signature:", err);
        setError(err instanceof Error ? err : new Error("Failed to verify signature"));
        setIsVerified(false);
      }
    },
    [anchorProvider]
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
