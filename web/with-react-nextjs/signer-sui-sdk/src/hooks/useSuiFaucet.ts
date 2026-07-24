"use client";

import { useState, useCallback } from "react";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { SUI_NETWORK } from "@/config/constants";
import { useParaSigner } from "./useParaSigner";

export function useSuiFaucet() {
  const { address, isReady } = useParaSigner();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const fund = useCallback(async () => {
    if (!address || !isReady) {
      setError(new Error("Wallet not ready"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestSuiFromFaucetV2({ host: getFaucetHost(SUI_NETWORK), recipient: address });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fund account"));
    } finally {
      setIsLoading(false);
    }
  }, [address, isReady]);

  return { fund, isLoading, error, success, isReady };
}
