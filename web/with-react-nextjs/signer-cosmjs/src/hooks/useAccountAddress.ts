"use client";

import { useAccount } from "@getpara/react-sdk";

export function useAccountAddress(): string | null {
  const { data: account } = useAccount();
  
  if (!account?.isConnected || !account.wallets?.[0]?.address) {
    return null;
  }
  
  return account.wallets[0].address;
}