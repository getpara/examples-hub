import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSuiSigner } from "@getpara/react-sdk-lite/chains/sui";
import { suiClient } from "@/lib/suiClient";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { suiSigner, isLoading } = useParaSuiSigner();

  const isReady = Boolean(suiSigner && isConnected && !isLoading);
  const address = suiSigner?.address ?? null;

  return {
    signer: suiSigner,
    client: suiClient,
    isReady,
    isLoading,
    address,
  };
}
