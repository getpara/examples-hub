import { useCallback } from "react";
import { useSignMessage } from "wagmi";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { signMessage, data: signature, isPending, error } = useSignMessage();
  const sign = useCallback(() => {
    signMessage({ message: HELLO_WORLD_MESSAGE });
  }, [signMessage]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    errorMessage: error?.message ?? null,
    signature,
  };
}
