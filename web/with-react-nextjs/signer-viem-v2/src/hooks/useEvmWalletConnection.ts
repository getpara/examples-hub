"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk-lite";

export function useEvmWalletConnection() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  return {
    address: wallet?.address ?? "",
    isConnected,
    openModal,
    wallet,
  };
}
