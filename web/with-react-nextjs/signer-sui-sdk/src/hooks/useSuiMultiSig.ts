"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { useParaSuiMultiSigSigner } from "@getpara/react-sdk-lite/chains/sui";

/**
 * Demonstrates a 2-of-2 Sui multisig where one member is the user's embedded Para wallet and the
 * other is an ephemeral keypair generated in the browser (standing in for a second co-signer).
 *
 * The co-signer keypair is created after mount (not during render) so the server and client agree on
 * the initial HTML — otherwise the derived multisig address would differ between SSR and hydration.
 */
export function useSuiMultiSig() {
  const [coSigner, setCoSigner] = useState<Ed25519Keypair | null>(null);
  useEffect(() => {
    setCoSigner(new Ed25519Keypair());
  }, []);

  const otherMembers = useMemo(
    () => (coSigner ? [{ publicKey: coSigner.getPublicKey(), weight: 1 }] : []),
    [coSigner]
  );

  // The Para hook derives the multisig, produces the Para member's partial signature, and combines
  // partials. It stays disabled until the co-signer (otherMembers) exists.
  const { multiSigSigner, isLoading: isSignerLoading } = useParaSuiMultiSigSigner({
    otherMembers,
    threshold: 2,
  });

  const [combinedSignature, setCombinedSignature] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isReady = Boolean(multiSigSigner && coSigner && !isSignerLoading);

  const sign = useCallback(
    async (message: string) => {
      if (!multiSigSigner || !coSigner) {
        setError(new Error("Multisig signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setCombinedSignature(null);
      setIsVerified(null);

      try {
        const bytes = new TextEncoder().encode(message.trim());

        // Each member signs the same bytes independently...
        const { signature: paraPartial } = await multiSigSigner.signPersonalMessage(bytes);
        const { signature: coPartial } = await coSigner.signPersonalMessage(bytes);

        // ...then the partials are combined into one multisig signature and verified.
        const combined = multiSigSigner.combine([paraPartial, coPartial]);
        const verified = await multiSigSigner.verifyPersonalMessage(bytes, combined);

        setCombinedSignature(combined);
        setIsVerified(verified);
      } catch (err) {
        console.error("Error producing multisig signature:", err);
        setError(err instanceof Error ? err : new Error("Failed to sign with multisig"));
      } finally {
        setIsLoading(false);
      }
    },
    [multiSigSigner, coSigner]
  );

  const reset = useCallback(() => {
    setCombinedSignature(null);
    setIsVerified(null);
    setError(null);
  }, []);

  return {
    sign,
    reset,
    isReady,
    isLoading,
    error,
    combinedSignature,
    isVerified,
    multiSigAddress: multiSigSigner?.address ?? null,
    coSignerAddress: coSigner?.getPublicKey().toSuiAddress() ?? null,
    threshold: 2,
  };
}
