import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../../actions/getAccount.js';
import { useInternalClient } from '../utils/useInternalClient.js';

export const ACCOUNT_BASE_KEY = 'PARA_ACCOUNT';

export const useIsFullyLoggedIn = () => {
  const client = useInternalClient();

  return useQuery({
    staleTime: 5000,
    queryKey: ['isFullyLoggedIn', client?.getUserId()],
    queryFn: async () => await client?.isFullyLoggedIn(),
  });
};

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
