import { useClient } from "@getpara/react-sdk";
import { useParaStellarSigner } from "@getpara/react-sdk/stellar";
import { useMutation } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { HELLO_WORLD_MESSAGE, STELLAR_TESTNET_PASSPHRASE } from "@/lib/chain";

export function useStellarSignMessage() {
  const para = useClient();
  const walletId = Object.values(para?.wallets ?? {}).find((wallet) => wallet.type === "STELLAR")?.id;
  const { stellarSigner } = useParaStellarSigner({ walletId, networkPassphrase: STELLAR_TESTNET_PASSPHRASE });

  const signing = useMutation({
    mutationFn: async () => {
      if (!stellarSigner) {
        throw new Error("No Stellar signer available");
      }

      const signature = await stellarSigner.signBytes(Buffer.from(new TextEncoder().encode(HELLO_WORLD_MESSAGE)));

      return signature.toString("base64");
    },
  });

  return {
    sign: () => signing.mutate(),
    isPending: signing.isPending,
    errorMessage: signing.error?.message ?? null,
    signature: signing.data,
  };
}
