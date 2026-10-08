import { useCallback, useEffect, useState } from "react";
import { useSignMessage } from "@getpara/react-sdk-lite";
import { postCanton } from "@/lib/cantonApi";
import type { GeneratedParty } from "@/lib/cantonTypes";
import { readStoredPartyId, storePartyId } from "@/lib/partyStorage";

interface CantonPartyOptions {
  address: string;
  walletId: string | undefined;
}

interface GenerateResponse {
  multiHash: string;
  generatedParty: GeneratedParty;
}

export function useCantonParty({ address, walletId }: CantonPartyOptions) {
  const { signMessageAsync } = useSignMessage();
  const [partyId, setPartyId] = useState<string | null>(null);
  const [multiHash, setMultiHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPartyId(address ? readStoredPartyId(address) : null);
    setMultiHash(null);
    setErrorMessage(null);
  }, [address]);

  const onboard = useCallback(async () => {
    setIsPending(true);
    setErrorMessage(null);
    setMultiHash(null);
    setPartyId(null);

    try {
      if (!address || !walletId) {
        throw new Error("This account has no Solana wallet. Add Solana to the API key in the Para Developer Portal.");
      }

      const generated = await postCanton<GenerateResponse>("generate", {
        solanaAddress: address,
        partyHint: `para-${address.slice(0, 8)}`,
      });
      setMultiHash(generated.multiHash);

      const result = await signMessageAsync({ walletId, messageBase64: generated.multiHash });
      if (!("signature" in result) || !result.signature) {
        throw new Error("Para signing was denied or returned no signature.");
      }

      const allocated = await postCanton<{ partyId: string }>("allocate", {
        signatureBase64: result.signature,
        generatedParty: generated.generatedParty,
      });
      setPartyId(allocated.partyId);
      storePartyId(address, allocated.partyId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Canton onboarding failed.");
    } finally {
      setIsPending(false);
    }
  }, [address, walletId, signMessageAsync]);

  return { onboard, partyId, multiHash, isPending, errorMessage };
}
