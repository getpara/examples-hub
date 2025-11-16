"use client";

import { useAccount, useWallet } from "@getpara/react-sdk";

export function useAccountAddress(): string | null {
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  
  if (!isConnected || !wallet?.address) {
    return null;
  }
  
  return wallet.address;
}