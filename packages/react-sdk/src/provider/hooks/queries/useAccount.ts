import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../../actions/getAccount.js';
import { useInternalClient } from '../utils/useInternalClient.js';

export const ACCOUNT_BASE_KEY = 'PARA_ACCOUNT';

/**
 * Hook for retrieving a user account
 */
export const useAccount = () => {
  const client = useInternalClient();

  return useQuery({
    queryKey: [ACCOUNT_BASE_KEY, client?.getUserId()],
    queryFn: async () => await getAccount(client),
  });
};
