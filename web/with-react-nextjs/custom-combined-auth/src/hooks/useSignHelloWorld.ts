import { useCallback } from "react";
import { useParaViemClient, useParaViemSignMessage } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { sepolia } from "viem/chains";

const HELLO_WORLD_MESSAGE = "Hello World!";

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

  const sign = useCallback(() => {
    signMessage({ message: HELLO_WORLD_MESSAGE });
  }, [signMessage]);

  return { sign, message: HELLO_WORLD_MESSAGE, isPending, errorMessage: error?.message ?? null, signature };
}
