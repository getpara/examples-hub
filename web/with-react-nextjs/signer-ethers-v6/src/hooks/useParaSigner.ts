import { useParaEthersSigner } from "@getpara/react-sdk-lite/chains/evm/ethers";
import { useEthersProvider } from "@/hooks/useEthersProvider";

export function useParaSigner() {
  const { provider } = useEthersProvider();
  const { ethersSigner } = useParaEthersSigner({ provider });

  return {
    signer: ethersSigner ?? null,
    provider,
  };
}
