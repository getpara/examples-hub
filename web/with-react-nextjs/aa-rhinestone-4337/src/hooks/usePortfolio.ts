import { useCallback, useEffect, useState } from "react";
import type { Portfolio, RhinestoneAccount } from "@rhinestone/sdk";

export function usePortfolio(account: RhinestoneAccount | null) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async (target: RhinestoneAccount) => {
    setIsFetching(true);
    setErrorMessage(null);

    try {
      setPortfolio(await target.getPortfolio());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load the portfolio.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    setPortfolio(null);
    setErrorMessage(null);

    if (account) {
      void load(account);
    }
  }, [account, load]);

  const refresh = useCallback(() => {
    if (account) {
      void load(account);
    }
  }, [account, load]);

  return {
    tokenCount: portfolio ? portfolio.length : null,
    isLoading: isFetching && portfolio === null,
    isRefreshing: isFetching && portfolio !== null,
    errorMessage,
    refresh,
  };
}
