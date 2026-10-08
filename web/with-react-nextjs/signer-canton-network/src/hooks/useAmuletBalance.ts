import { useCallback, useState } from "react";
import { postCanton } from "@/lib/cantonApi";

interface BalanceReading {
  partyId: string;
  amount: string | null;
  errorMessage: string | null;
}

export function useAmuletBalance(partyId: string | null) {
  const [reading, setReading] = useState<BalanceReading | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!partyId) {
      return;
    }

    setIsRefreshing(true);
    try {
      const { amount } = await postCanton<{ amount: string }>("balance", { partyId });
      setReading({ partyId, amount, errorMessage: null });
    } catch (error) {
      setReading({ partyId, amount: null, errorMessage: error instanceof Error ? error.message : "Balance fetch failed." });
    } finally {
      setIsRefreshing(false);
    }
  }, [partyId]);

  const current = reading && reading.partyId === partyId ? reading : null;

  return {
    amount: current?.amount ?? null,
    errorMessage: current?.errorMessage ?? null,
    isRefreshing,
    refresh,
  };
}
