"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { useOfflineSigners } from "graz";
import { makeSignDoc, type OfflineAminoSigner } from "@cosmjs/amino";

const HELLO_WORLD_MESSAGE = "Hello World!";
const CHAIN_ID = "cosmoshub-4";

export function useSignHelloWorld() {
  const { connectionType } = useAccount();
  const { aminoSigner: embeddedSigner } = useParaCosmjsAminoSigner();
  const { data: grazSigners } = useOfflineSigners();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const isExternal = connectionType === "external";
  const externalSigner = grazSigners?.offlineSignerAmino as OfflineAminoSigner | undefined;
  const signer: OfflineAminoSigner | null | undefined = isExternal ? externalSigner : embeddedSigner;

  const sign = useCallback(async () => {
    if (!signer) return;
    setIsPending(true);
    setError(null);

    try {
      const accounts = await signer.getAccounts();
      if (!accounts.length) throw new Error("No Cosmos accounts found");
      const address = accounts[0].address;

      const signDoc = makeSignDoc(
        [{ type: "sign/MsgSignData", value: { signer: address, data: btoa(HELLO_WORLD_MESSAGE) } }],
        { amount: [], gas: "0" },
        CHAIN_ID,
        "",
        0,
        0
      );

      const { signature: sig } = await signer.signAmino(address, signDoc);
      setSignature(sig.signature);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign message"));
    } finally {
      setIsPending(false);
    }
  }, [signer]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    error,
    signature,
  };
}
