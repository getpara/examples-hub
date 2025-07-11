import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';

export const IS_FULLY_LOGGED_IN_BASE_KEY = 'PARA_FULLY_LOGGED_IN';

/**
 * Hook for returning whether the user is fully logged in with Para
 */
export const useIsFullyLoggedIn = () => {
  const client = useInternalClient();

  return useQuery({
    enabled: !!client?.isReady,
    staleTime: 5000,
    queryKey: [IS_FULLY_LOGGED_IN_BASE_KEY, client?.userId ?? null],
    queryFn: async () => (await client?.isFullyLoggedIn()) ?? false,
  });
};
