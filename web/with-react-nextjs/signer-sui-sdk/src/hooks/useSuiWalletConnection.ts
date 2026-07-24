"use client";

import { useEffect } from "react";
import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk-lite";
import { useParaSuiSigner } from "@getpara/react-sdk-lite/chains/sui";

export function useSuiWalletConnection() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const account = useAccount();
  const { setSelectedWallet } = useWalletState();
  const { suiSigner } = useParaSuiSigner();
  const suiWallet = account?.embedded?.wallets?.find((embeddedWallet) => embeddedWallet.type === "SUI");

  useEffect(() => {
    if (account?.isConnected && wallet?.type !== "SUI" && suiWallet) {
      setSelectedWallet({ id: suiWallet.id, type: "SUI" });
    }
  }, [account?.isConnected, wallet?.type, suiWallet, setSelectedWallet]);

  return {
    // Sui reuses the Solana Ed25519 key, so the wallet's stored `address` is the base58 Solana form.
    // The signer exposes the derived 0x Sui address (blake2b of the public key) — use that for display.
    address: suiSigner?.address ?? "",
    isConnected: Boolean(account?.isConnected),
    openModal,
    wallet,
  };
}
