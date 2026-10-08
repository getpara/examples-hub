import { useCallback } from "react";
import { useSignMessage } from "wagmi";
import { HELLO_WORLD_MESSAGE } from "@/lib/chain";

export function useEvmSignMessage() {
  const { signMessage, data, isPending, error } = useSignMessage();

  const sign = useCallback(() => {
    signMessage({ message: HELLO_WORLD_MESSAGE });
  }, [signMessage]);

  return {
    sign,
    isPending,
    errorMessage: error?.message ?? null,
    signature: data,
  };
}
