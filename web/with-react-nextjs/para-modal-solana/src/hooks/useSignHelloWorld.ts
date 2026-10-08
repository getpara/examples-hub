import { useCallback, useState } from "react";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { createSolanaRpc } from "@solana/rpc";
import { SOLANA_DEVNET } from "@/lib/chain";
import { bytesToBase64 } from "@/lib/base64";

const HELLO_WORLD_MESSAGE = "Hello World!";
const rpc = createSolanaRpc(SOLANA_DEVNET.rpcUrl);

export function useSignHelloWorld() {
  const { embedded } = useAccount();
  const { data: wallet } = useWallet();
  const { solanaSigner } = useParaSolanaSigner({ rpc });

  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const isExternal = wallet?.isExternal ?? !embedded.isConnected;

  const sign = useCallback(async () => {
    setIsPending(true);
    setErrorMessage(null);
    setSignature(undefined);

    try {
      if (!solanaSigner) throw new Error("No Solana signer available");
      const encoded = new TextEncoder().encode(HELLO_WORLD_MESSAGE);
      const results = await solanaSigner.signMessages([{ content: encoded, signatures: {} }]);
      const signatureBytes = Object.values(results[0] ?? {})[0];
      if (!(signatureBytes instanceof Uint8Array)) throw new Error("Unexpected signing result format");
      setSignature(bytesToBase64(signatureBytes));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to sign message");
    } finally {
      setIsPending(false);
    }
  }, [solanaSigner]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isExternal,
    isPending,
    errorMessage,
    signature,
  };
}
