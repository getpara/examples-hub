import { useState, useCallback } from "react";
import { useParaSuiSignPersonalMessage } from "@getpara/react-sdk-lite/chains/sui";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useMessageSigning() {
  const { signer, isReady } = useParaSigner();
  const { signPersonalMessageAsync } = useParaSuiSignPersonalMessage(signer);

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
        const messageBytes = new TextEncoder().encode(message.trim());
        const { signature: sig } = await signPersonalMessageAsync(messageBytes);
        setSignature(sig);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to sign message"));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, isReady, signPersonalMessageAsync]
  );

  const verifySignature = useCallback(
    async (message: string) => {
      if (!signer || !signature) {
        setError(new Error("No signer or signature to verify"));
        return;
      }

      try {
        const messageBytes = new TextEncoder().encode(message.trim());
        const valid = await signer.getPublicKey().verifyPersonalMessage(messageBytes, signature);
        setIsVerified(valid);
      } catch (err) {
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
