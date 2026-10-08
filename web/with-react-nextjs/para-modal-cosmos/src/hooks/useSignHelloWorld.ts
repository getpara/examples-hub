import { useCallback, useState } from "react";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { useParaCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { makeSignDoc } from "@cosmjs/amino";

const HELLO_WORLD_MESSAGE = "Hello World!";
const ADR036_CHAIN_ID = "";

export function useSignHelloWorld() {
  const { embedded } = useAccount();
  const { data: wallet } = useWallet();
  const { aminoSigner } = useParaCosmjsAminoSigner();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const isExternal = wallet?.isExternal ?? !embedded.isConnected;

  const sign = useCallback(async () => {
    setIsPending(true);
    setError(null);

    try {
      if (!aminoSigner) throw new Error("No Cosmos signer available");
      const accounts = await aminoSigner.getAccounts();
      if (!accounts.length) throw new Error("No Cosmos accounts found");
      const address = accounts[0].address;

      const signDoc = makeSignDoc(
        [{ type: "sign/MsgSignData", value: { signer: address, data: btoa(HELLO_WORLD_MESSAGE) } }],
        { amount: [], gas: "0" },
        ADR036_CHAIN_ID,
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
  }, [aminoSigner]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isExternal,
    isPending,
    errorMessage: error?.message ?? null,
    signature,
  };
}
