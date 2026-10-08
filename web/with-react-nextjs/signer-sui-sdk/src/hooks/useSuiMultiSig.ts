import { useState, useEffect, useMemo, useCallback } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { useParaSuiMultiSigSigner } from "@getpara/react-sdk-lite/chains/sui";

export function useSuiMultiSig() {
  const [coSigner, setCoSigner] = useState<Ed25519Keypair | null>(null);
  useEffect(() => {
    setCoSigner(new Ed25519Keypair());
  }, []);

  const otherMembers = useMemo(
    () => (coSigner ? [{ publicKey: coSigner.getPublicKey(), weight: 1 }] : []),
    [coSigner]
  );

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

        const { signature: paraPartial } = await multiSigSigner.signPersonalMessage(bytes);
        const { signature: coPartial } = await coSigner.signPersonalMessage(bytes);

        const combined = multiSigSigner.combine([paraPartial, coPartial]);
        const verified = await multiSigSigner.verifyPersonalMessage(bytes, combined);

        setCombinedSignature(combined);
        setIsVerified(verified);
      } catch (err) {
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
