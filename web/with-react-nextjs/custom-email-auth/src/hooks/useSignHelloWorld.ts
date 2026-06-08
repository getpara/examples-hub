import { useCallback } from "react";
import { useParaViemClient, useParaViemSignMessage } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { sepolia } from "viem/chains";

export const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { viemClient } = useParaViemClient({
    walletClientConfig: { chain: sepolia, transport: http() },
  });
  const {
    data: signature,
    error,
    isPending,
    signMessage,
  } = useParaViemSignMessage(viemClient);

  const signHelloWorld = useCallback(() => {
    signMessage({ message: HELLO_WORLD_MESSAGE });
  }, [signMessage]);

  return {
    errorMessage: error?.message ?? null,
    isPending,
    message: HELLO_WORLD_MESSAGE,
    signMessage: signHelloWorld,
    signature,
  };
}
