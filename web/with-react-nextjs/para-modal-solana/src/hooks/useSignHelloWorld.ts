"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { createSolanaRpc } from "@solana/rpc";

const HELLO_WORLD_MESSAGE = "Hello World!";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = createSolanaRpc("https://api.devnet.solana.com" as Parameters<typeof createSolanaRpc>[0]) as any;

type SolanaSignMessageRequest = {
  content: Uint8Array;
  signatures: Record<string, Uint8Array>;
};

type ParaSolanaMessageSigner = {
  signMessages(messages: SolanaSignMessageRequest[]): Promise<Array<Record<string, Uint8Array>>>;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function useSignHelloWorld() {
  const { connectionType } = useAccount();
  const { solanaSigner } = useParaSolanaSigner({ rpc });
  const { signMessage: solanaWalletSign } = useSolanaWallet();

  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const isExternal = connectionType === "external";

  const sign = useCallback(async () => {
    setIsPending(true);
    setErrorMessage(null);
    setSignature(undefined);

    try {
      const encoded = new TextEncoder().encode(HELLO_WORLD_MESSAGE);

      if (isExternal && solanaWalletSign) {
        const sig = await solanaWalletSign(encoded);
        setSignature(bytesToBase64(sig));
      } else if (solanaSigner) {
        const signer = solanaSigner as ParaSolanaMessageSigner;
        const results = await signer.signMessages([{ content: encoded, signatures: {} }]);
        const sigBytes = Object.values(results[0] as Record<string, Uint8Array>)[0];
        if (!sigBytes) throw new Error("Unexpected signing result format");
        setSignature(bytesToBase64(sigBytes));
      } else {
        throw new Error("No Solana signer available");
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Failed to sign message"));
    } finally {
      setIsPending(false);
    }
  }, [isExternal, solanaWalletSign, solanaSigner]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    errorMessage,
    signature,
  };
}
