import { useSignMessage } from "wagmi";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { signMessage, isPending, error, data: signature } = useSignMessage();

  const sign = () => signMessage({ message: HELLO_WORLD_MESSAGE });

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    error,
    signature,
  };
}
