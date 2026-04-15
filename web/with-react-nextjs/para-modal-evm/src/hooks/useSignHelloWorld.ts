"use client";

import { useSignMessage } from "wagmi";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { signMessage, data: signature, isPending, error } = useSignMessage();

  return {
    sign: () => signMessage({ message: HELLO_WORLD_MESSAGE }),
    message: HELLO_WORLD_MESSAGE,
    isPending,
    error,
    signature,
  };
}
