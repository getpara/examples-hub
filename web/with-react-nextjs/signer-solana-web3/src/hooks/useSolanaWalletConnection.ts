"use client";

import { useEffect } from "react";
import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk-lite";

export function useSolanaWalletConnection() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const account = useAccount();
  const { setSelectedWallet } = useWalletState();
  const solanaWallet = account?.embedded?.wallets?.find((embeddedWallet) => embeddedWallet.type === "SOLANA");

  useEffect(() => {
    if (account?.isConnected && wallet?.type !== "SOLANA" && solanaWallet) {
      setSelectedWallet({ id: solanaWallet.id, type: "SOLANA" });
    }
  }, [account?.isConnected, wallet?.type, solanaWallet, setSelectedWallet]);

  return {
    address: wallet?.address ?? solanaWallet?.address ?? "",
    isConnected: Boolean(account?.isConnected),
    openModal,
    wallet,
  };
}
