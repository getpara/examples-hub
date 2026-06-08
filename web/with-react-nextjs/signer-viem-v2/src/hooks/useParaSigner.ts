"use client";

import { http } from "viem";
import { useParaViemAccount, useParaViemClient } from "@getpara/react-sdk-lite/chains/evm";
import { HOLESKY_RPC_URL } from "@/config/constants";
import { CHAIN, publicClient } from "@/lib/viem";

export function useParaSigner() {
  const { viemAccount, isLoading: isAccountLoading } = useParaViemAccount();
  const { viemClient, isLoading: isClientLoading } = useParaViemClient({
    walletClientConfig: {
      chain: CHAIN,
      transport: http(HOLESKY_RPC_URL),
    },
  });

  const address = viemAccount?.address ?? viemClient?.account?.address ?? null;
  const account = viemClient?.account ?? viemAccount ?? address ?? undefined;

  return {
    viemAccount,
    viemClient,
    publicClient,
    account,
    address,
    isLoading: isAccountLoading || isClientLoading,
    isReady: Boolean(viemClient && account && address),
  };
}
