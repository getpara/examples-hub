"use client";

import { useAccount } from "@getpara/react-sdk";

export function useAccountAddress() {
  const { data: account } = useAccount();
  
  const address = account?.isConnected && account.wallets?.[0]?.address 
    ? account.wallets[0].address as `0x${string}` 
    : null;

  return address;
}