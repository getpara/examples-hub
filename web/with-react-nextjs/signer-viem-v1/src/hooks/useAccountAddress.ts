"use client";

import { useAccount, useWallet } from "@getpara/react-sdk";

export function useAccountAddress() {
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  
  const address = isConnected && wallet?.address 
    ? wallet.address as `0x${string}` 
    : null;

  return address;
}