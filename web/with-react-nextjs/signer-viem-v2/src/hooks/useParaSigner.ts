import { http } from "viem";
import { useParaViemClient } from "@getpara/react-sdk-lite/chains/evm/viem";
import { HOLESKY } from "@/lib/chain";

export function useParaSigner() {
  const { viemClient } = useParaViemClient({
    walletClientConfig: {
      chain: HOLESKY.chain,
      transport: http(HOLESKY.rpcUrl),
    },
  });

  const account = viemClient?.account;
  const address = account?.address ?? null;

  return {
    viemClient,
    account,
    address,
    isReady: Boolean(viemClient && account),
  };
}
