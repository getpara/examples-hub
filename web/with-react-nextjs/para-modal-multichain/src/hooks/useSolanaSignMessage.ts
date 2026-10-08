import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { createSolanaRpc } from "@solana/rpc";
import { useMutation } from "@tanstack/react-query";
import { bytesToBase64 } from "@/lib/base64";
import { HELLO_WORLD_MESSAGE, SOLANA_DEVNET_RPC_URL } from "@/lib/chain";

const rpc = createSolanaRpc(SOLANA_DEVNET_RPC_URL);

export function useSolanaSignMessage() {
  const { solanaSigner } = useParaSolanaSigner({ rpc });

  const signing = useMutation({
    mutationFn: async () => {
      const message = new TextEncoder().encode(HELLO_WORLD_MESSAGE);

      if (!solanaSigner) {
        throw new Error("No Solana signer available");
      }

      const [signatures] = await solanaSigner.signMessages([{ content: message, signatures: {} }]);
      const signature = Object.values(signatures ?? {})[0];

      if (!(signature instanceof Uint8Array)) {
        throw new Error("Unexpected signing result format");
      }

      return bytesToBase64(signature);
    },
  });

  return {
    sign: () => signing.mutate(),
    isPending: signing.isPending,
    errorMessage: signing.error?.message ?? null,
    signature: signing.data,
  };
}
