"use client";

import { useEffect } from "react";
import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk-lite";

export function useStellarWalletConnection() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const account = useAccount();
  const { setSelectedWallet } = useWalletState();
  const stellarWallet = account?.embedded?.wallets?.find((embeddedWallet) => embeddedWallet.type === "STELLAR");

  useEffect(() => {
    if (account?.isConnected && wallet?.type !== "STELLAR" && stellarWallet) {
      setSelectedWallet({ id: stellarWallet.id, type: "STELLAR" });
    }
  }, [account?.isConnected, wallet?.type, stellarWallet, setSelectedWallet]);

  return {
    address: wallet?.type === "STELLAR" ? wallet.address : stellarWallet?.address ?? "",
    isConnected: Boolean(account?.isConnected),
    openModal,
    wallet,
  };
}
