import { useCallback } from "react";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { useSignMessage } from "wagmi";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { embedded } = useAccount();
  const { data: wallet } = useWallet();
  const { signMessage, data: signature, isPending, error } = useSignMessage();

  const isExternal = wallet?.isExternal ?? !embedded.isConnected;

  const sign = useCallback(() => {
    signMessage({ message: HELLO_WORLD_MESSAGE });
  }, [signMessage]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isExternal,
    isPending,
    errorMessage: error?.message ?? null,
    signature,
  };
}
