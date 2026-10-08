import { readonly, ref } from "vue";
import { createParaViemClient } from "@getpara/viem-v2-integration";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { para } from "@/lib/para";

export const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const signature = ref<string | null>(null);
  const isPending = ref(false);
  const errorMessage = ref<string | null>(null);

  async function signMessage(): Promise<void> {
    if (isPending.value) {
      return;
    }

    isPending.value = true;
    errorMessage.value = null;

    try {
      const walletClient = createParaViemClient({
        para,
        walletClientConfig: { chain: sepolia, transport: http() },
      });
      signature.value = await walletClient.signMessage({ message: HELLO_WORLD_MESSAGE });
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Failed to sign message";
      signature.value = null;
    } finally {
      isPending.value = false;
    }
  }

  return {
    message: HELLO_WORLD_MESSAGE,
    signature: readonly(signature),
    isPending: readonly(isPending),
    errorMessage: readonly(errorMessage),
    signMessage,
  };
}
