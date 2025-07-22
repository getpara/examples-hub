import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';
import { accountLinkInProgress } from '../../actions/index.js';

export const ACCOUNT_LINK_IN_PROGRESS_BASE_KEY = 'ACCOUNT_LINK_IN_PROGRESS';

/**
 * Hook for returning the account linking status of the user
 * @returns A query that returns the account linking status
 */
export const useAccountLinkInProgress = () => {
  const client = useInternalClient();

  return useQuery({
    enabled: !!client?.isReady,
    queryKey: [ACCOUNT_LINK_IN_PROGRESS_BASE_KEY, client?.userId ?? null, client?.accountLinkInProgress ?? null],
    queryFn: async () => (await accountLinkInProgress(client)) ?? null,
  });
};
