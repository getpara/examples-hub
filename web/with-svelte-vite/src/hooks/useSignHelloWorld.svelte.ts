import { createParaViemClient } from "@getpara/viem-v2-integration";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { para } from "@/lib/para";

export const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  let signature = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);
  let isPending = $state(false);

  async function signMessage() {
    if (isPending) {
      return;
    }

    isPending = true;
    errorMessage = null;

    try {
      const walletClient = createParaViemClient({
        para,
        walletClientConfig: { chain: sepolia, transport: http() },
      });
      signature = await walletClient.signMessage({ message: HELLO_WORLD_MESSAGE });
    } catch (signError) {
      errorMessage = signError instanceof Error ? signError.message : "Failed to sign message";
      signature = null;
    } finally {
      isPending = false;
    }
  }

  function reset() {
    signature = null;
    errorMessage = null;
  }

  return {
    message: HELLO_WORLD_MESSAGE,
    get signature() {
      return signature;
    },
    get errorMessage() {
      return errorMessage;
    },
    get isPending() {
      return isPending;
    },
    signMessage,
    reset,
  };
}
