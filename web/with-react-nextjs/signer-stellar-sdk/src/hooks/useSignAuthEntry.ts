"use client";

import { useState, useCallback } from "react";
import { useParaSigner } from "./useParaSigner";

export function useSignAuthEntry() {
  const { signer, isReady } = useParaSigner();
  const [signedEntry, setSignedEntry] = useState<string | null>(null);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signAuthEntry = useCallback(
    async (authEntryBase64: string) => {
      if (!signer || !isReady) {
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setSignedEntry(null);
      setSignerAddress(null);

      try {
        const result = await signer.signAuthEntry(authEntryBase64);
        setSignedEntry(result.signedAuthEntry);
        setSignerAddress(result.signerAddress ?? null);
      } catch (err) {
        console.error("Error signing auth entry:", err);
        setError(err instanceof Error ? err : new Error("Failed to sign auth entry"));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, isReady]
  );

  return { signAuthEntry, signedEntry, signerAddress, isLoading, error, isReady };
}
