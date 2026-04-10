"use client";

import { useState, useCallback } from "react";
import { useParaCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { makeSignDoc } from "@cosmjs/amino";

const HELLO_WORLD_MESSAGE = "Hello World!";
const CHAIN_ID = "cosmoshub-4";

export function useSignHelloWorld() {
  const { aminoSigner, isLoading } = useParaCosmjsAminoSigner();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const address = aminoSigner?.address;

  const sign = useCallback(async () => {
    if (!aminoSigner || !address) return;

    setIsPending(true);
    setError(null);

    try {
      // ADR-036: Arbitrary message signing using Amino
      const signDoc = makeSignDoc(
        [{ type: "sign/MsgSignData", value: { signer: address, data: btoa(HELLO_WORLD_MESSAGE) } }],
        { amount: [], gas: "0" },
        CHAIN_ID,
        "",
        0,
        0
      );

      const { signature: sig } = await aminoSigner.signAmino(address, signDoc);
      setSignature(sig.signature);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign message"));
    } finally {
      setIsPending(false);
    }
  }, [aminoSigner, address]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    address,
    isPending: isLoading || isPending,
    error,
    signature,
  };
}
