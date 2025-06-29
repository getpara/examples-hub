"use client";

import { useEffect, useState } from "react";
import { useAccount, ParaWeb, Environment } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v1-integration";
import { LocalAccount, WalletClient } from "viem";
import { holesky } from "viem/chains";
import { http } from "viem";
import { API_KEY, ENVIRONMENT, HOLESKY_RPC_URL } from "@/config/constants";

export function useParaSigner() {
  const { data: account } = useAccount();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [viemAccount, setViemAccount] = useState<LocalAccount | null>(null);

  useEffect(() => {
    if (account?.isConnected && API_KEY) {
      const para = new ParaWeb(ENVIRONMENT, API_KEY);
      const paraViemAccount = createParaAccount(para);
      const wallet = createParaViemClient(para, {
        account: paraViemAccount,
        chain: holesky,
        transport: http(HOLESKY_RPC_URL),
      });
      
      setWalletClient(wallet);
      setViemAccount(paraViemAccount);
    } else {
      setWalletClient(null);
      setViemAccount(null);
    }
  }, [account?.isConnected]);

  const address = account?.isConnected && account.wallets?.[0]?.address 
    ? account.wallets[0].address as `0x${string}` 
    : null;

  return { walletClient, viemAccount, address };
}