"use client";

import { useState, useCallback } from "react";
import { FRIENDBOT_URL } from "@/config/constants";
import { useParaSigner } from "./useParaSigner";

export function useFriendbot() {
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
      const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Friendbot error: ${body}`);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fund account"));
    } finally {
      setIsLoading(false);
    }
  }, [address, isReady]);

  return { fund, isLoading, error, success, isReady };
}
