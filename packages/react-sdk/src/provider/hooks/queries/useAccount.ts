import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../../actions/getAccount.js';
import { useInternalClient } from '../utils/useInternalClient.js';
import { useIsFullyLoggedIn } from './useIsFullyLoggedIn.js';

export const ACCOUNT_BASE_KEY = 'PARA_ACCOUNT';

/**
 * Hook for retrieving a user account
 */
export const useAccount = () => {
  const client = useInternalClient();
  const { data: isFullyLoggedIn, isSuccess } = useIsFullyLoggedIn();

  return useQuery({
    enabled: isSuccess && !!client,
    queryKey: [ACCOUNT_BASE_KEY, isFullyLoggedIn ?? null, client?.userId ?? null, client?.isGuestMode ?? null],
    queryFn: async () => await getAccount(client, isFullyLoggedIn),
  });
};
