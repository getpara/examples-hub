import { useParaCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { makeSignDoc } from "@cosmjs/amino";
import { useMutation } from "@tanstack/react-query";
import { HELLO_WORLD_MESSAGE } from "@/lib/chain";

const ADR036_CHAIN_ID = "";

export function useCosmosSignMessage() {
  const { aminoSigner: signer } = useParaCosmjsAminoSigner();

  const signing = useMutation({
    mutationFn: async () => {
      if (!signer) {
        throw new Error("No Cosmos signer available");
      }

      const [account] = await signer.getAccounts();

      if (!account) {
        throw new Error("No Cosmos accounts found");
      }

      const signDoc = makeSignDoc(
        [{ type: "sign/MsgSignData", value: { signer: account.address, data: btoa(HELLO_WORLD_MESSAGE) } }],
        { amount: [], gas: "0" },
        ADR036_CHAIN_ID,
        "",
        0,
        0
      );
      const { signature } = await signer.signAmino(account.address, signDoc);

      return signature.signature;
    },
  });

  return {
    sign: () => signing.mutate(),
    isPending: signing.isPending,
    errorMessage: signing.error?.message ?? null,
    signature: signing.data,
  };
}
