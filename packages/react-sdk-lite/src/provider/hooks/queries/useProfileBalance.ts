import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useStore } from '../../stores/useStore.js';
import { useInternalClient } from '../utils/useInternalClient.js';
import { useIsFullyLoggedIn } from './useIsFullyLoggedIn.js';
import { ProfileBalance } from '@getpara/web-sdk';
import { filterProfileBalance } from '@getpara/shared';

/**
 * Options for the useProfileBalance hook.
 */
type UseProfileBalanceOptions = {
  /**
   * A value that, when changed, will recalculate the current profile's balances.
   *
   * Use a counter (increment when you want to refetch) or timestamp for one-time refetches.
   *
   * When not provided, internal SDK events (like asset transfers) will still trigger refetches via React Query invalidation.
   */
  refetchTrigger?: number | string;
  /**
   * Whether to return the comprehensive balance set. If `false` or `undefined`, the results will be filtered and modified based on your `ParaProvider`'s balances configuration.
   */
  isComprehensive?: boolean;
};

/**
 * React Query hook for retrieving the asset balance for your currently connected wallets.
 *
 * @returns {ProfileBalance}
 *   The profile balance object, containing the aggregated balance for all wallets and entries for each wallet, further divided by various assets and networks.
 *
 *   The profile balance will be denoted in USD or in a custom asset you specify, depending on your ParaProvider configuration.
 */
export const useProfileBalance = (options?: UseProfileBalanceOptions): UseQueryResult<ProfileBalance> => {
  const client = useInternalClient();
  const { data: isFullyLoggedIn, isSuccess } = useIsFullyLoggedIn();
  const config = useStore(state => state.modalConfig?.balances);
  const refs = useStore(state => state.refs);

  const isComprehensive = options?.isComprehensive ?? false;

  // Track the previous external trigger to detect changes
  const previousTriggerRef = useRef<number | string | undefined>(options?.refetchTrigger);
  const shouldRefetchRef = useRef(false);
  const lastQueryTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  // Detect when the external refetchTrigger changes
  useEffect(() => {
    if (options?.refetchTrigger !== previousTriggerRef.current) {
      shouldRefetchRef.current = true;
      previousTriggerRef.current = options?.refetchTrigger;
    }
  }, [options?.refetchTrigger]);

  return useQuery({
    enabled: isSuccess && !!client,
    queryKey: [
      'useProfileBalance',
      isFullyLoggedIn ?? null,
      client?.userId ?? null,
      client?.availableWallets.map(({ address }) => address) ?? null,
      config ?? null,
      // Note: refetchTrigger is NOT in query key to allow cache sharing
    ],
    staleTime: 30000,
    retry: 3,
    queryFn: async () => {
      if (!client || !isFullyLoggedIn) {
        return null;
      }

      // Check if this query is being called due to invalidation
      // If the last invalidation was after our last query, this is an invalidation-triggered refetch
      const isInvalidationRefetch = (refs.balancesInvalidationTime.current ?? 0) > lastQueryTimeRef.current;

      // Always refetch on initial page load to ensure fresh data
      const isInitialLoad = isInitialLoadRef.current;

      const profileBalance = await client?.getProfileBalance({
        config,
        refetch: shouldRefetchRef.current || isInvalidationRefetch || isInitialLoad,
      });

      // Update our last query time and reset flags
      lastQueryTimeRef.current = Date.now();
      shouldRefetchRef.current = false;
      isInitialLoadRef.current = false;

      return isComprehensive
        ? profileBalance
        : filterProfileBalance(profileBalance, config || { displayType: 'AGGREGATED' });
    },
    // We handle refetch manually
    refetchOnWindowFocus: false,
  });
};
