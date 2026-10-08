import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSolanaSigner } from "@getpara/react-sdk-lite/chains/solana";
import { useSolana } from "@/hooks/useSolana";

export function useParaSigner() {
  const account = useAccount();
  const { rpc, paraRpc } = useSolana();
  const { solanaSigner, isLoading } = useParaSolanaSigner({ rpc: paraRpc });

  return {
    signer: solanaSigner,
    rpc,
    isLoading,
    isReady: Boolean(solanaSigner && account?.isConnected && !isLoading),
    address: solanaSigner?.address?.toString() ?? null,
  };
}
