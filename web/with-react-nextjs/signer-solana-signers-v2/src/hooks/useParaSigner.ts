"use client";

import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSolanaSigner } from "@getpara/react-sdk-lite/chains/solana";
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
