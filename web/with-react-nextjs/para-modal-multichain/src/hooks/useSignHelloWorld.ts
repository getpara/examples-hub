import { useWallet, useSignMessage } from "@getpara/react-sdk";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { data: wallet } = useWallet();
  const signMessage = useSignMessage();

  const sign = () =>
    wallet?.id &&
    signMessage.signMessage({
      walletId: wallet.id,
      messageBase64: btoa(HELLO_WORLD_MESSAGE),
    });

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending: signMessage.isPending,
    error: signMessage.error,
    signature: signMessage.data && "signature" in signMessage.data ? signMessage.data.signature : undefined,
  };
}
