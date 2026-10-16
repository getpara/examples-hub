import { useMemo } from "react";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { createBridgeAdapter } from "@/lib/bridgeAdapter";

export function useParaBridgeAdapter() {
  const { viemAccount, isLoading } = useParaViemAccount();
  const adapter = useMemo(() => (viemAccount ? createBridgeAdapter(viemAccount) : null), [viemAccount]);

  return {
    adapter,
    isLoading,
  };
}
