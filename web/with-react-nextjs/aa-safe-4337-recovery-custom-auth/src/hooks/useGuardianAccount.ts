import { useMemo } from "react";
import { createParaViemAccount } from "@getpara/viem-v2-integration";
import type ParaWeb from "@getpara/web-sdk";

export function useGuardianAccount(para: ParaWeb | null, address: `0x${string}` | null) {
  const account = useMemo(() => {
    if (!para || !address) return null;
    return createParaViemAccount({ para, address });
  }, [address, para]);

  return { account };
}
