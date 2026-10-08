import { useAccount } from "@getpara/react-sdk-lite";
import { useParaStellarSigner } from "@getpara/react-sdk-lite/chains/stellar";
import { Networks } from "@stellar/stellar-sdk";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { stellarSigner, isLoading } = useParaStellarSigner({ networkPassphrase: Networks.TESTNET });

  return {
    signer: stellarSigner,
    isReady: Boolean(stellarSigner && isConnected && !isLoading),
    isLoading,
    address: stellarSigner?.address ?? null,
  };
}
