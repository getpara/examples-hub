"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { createSolanaRpc } from "@solana/rpc";

const HELLO_WORLD_MESSAGE = "Hello World!";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = createSolanaRpc("https://api.devnet.solana.com" as Parameters<typeof createSolanaRpc>[0]) as any;

export function useSignHelloWorld() {
  const { connectionType } = useAccount();
  const { solanaSigner } = useParaSolanaSigner({ rpc });
  const { signMessage: solanaWalletSign } = useSolanaWallet();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const isExternal = connectionType === "external";

  const sign = useCallback(async () => {
    setIsPending(true);
    setError(null);

    try {
      const encoded = new TextEncoder().encode(HELLO_WORLD_MESSAGE);

      if (isExternal && solanaWalletSign) {
        const sig = await solanaWalletSign(encoded);
        setSignature(Buffer.from(sig).toString("base64"));
      } else if (solanaSigner) {
        const results = await (solanaSigner as any).signMessages([{ content: encoded, signatures: {} }]);
        const sigBytes = Object.values(results[0] as Record<string, Uint8Array>)[0];
        if (!sigBytes) throw new Error("Unexpected signing result format");
        setSignature(Buffer.from(sigBytes).toString("base64"));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign message"));
    } finally {
      setIsPending(false);
    }
  }, [isExternal, solanaWalletSign, solanaSigner]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    error,
    signature,
  };
}
