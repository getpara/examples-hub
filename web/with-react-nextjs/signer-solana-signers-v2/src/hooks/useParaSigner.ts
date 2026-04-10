"use client";

import { useAccount } from "@getpara/react-sdk";
import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const account = useAccount();
  const { rpc, paraRpc } = useSolana();
  const { solanaSigner, isLoading } = useParaSolanaSigner({ rpc: paraRpc });

  const isReady = Boolean(solanaSigner && account?.isConnected && !isLoading);

  return {
    signer: solanaSigner,
    rpc,
    isLoading,
    isReady,
    address: solanaSigner?.address?.toString() ?? null,
  };
}
