import { useCallback } from "react";
import { useSignMessage, useWallet } from "@getpara/react-sdk";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { data: wallet } = useWallet();
  const signMessage = useSignMessage();

  const sign = useCallback(() => {
    if (!wallet?.id) {
      return;
    }

    signMessage.signMessage({
      walletId: wallet.id,
      messageBase64: btoa(HELLO_WORLD_MESSAGE),
    });
  }, [signMessage, wallet?.id]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending: signMessage.isPending,
    errorMessage: signMessage.error?.message ?? null,
    signature: signMessage.data && "signature" in signMessage.data ? signMessage.data.signature : undefined,
  };
}
