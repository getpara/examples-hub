import { useEffect } from "react";
import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk-lite";

export function useCantonWallet() {
  const { openModal } = useModal();
  const account = useAccount();
  const { data: wallet } = useWallet();
  const { setSelectedWallet } = useWalletState();

  useEffect(() => {
    if (account.isConnected && wallet?.type !== "SOLANA") {
      const solanaWallet = account.embedded.wallets?.find((embeddedWallet) => embeddedWallet.type === "SOLANA");
      if (solanaWallet) {
        setSelectedWallet({ id: solanaWallet.id, type: "SOLANA" });
      }
    }
  }, [account, wallet, setSelectedWallet]);

  const isSolanaWallet = wallet?.type === "SOLANA";

  return {
    isConnected: account.isConnected,
    openModal,
    address: isSolanaWallet ? (wallet.address ?? "") : "",
    walletId: isSolanaWallet ? wallet.id : undefined,
  };
}
