import { useQuery } from '@tanstack/react-query';
import { useClient } from '../index.js';
import { getAccount } from '../../actions/getAccount.js';

export const ACCOUNT_BASE_KEY = 'PARA_ACCOUNT';

/**
 * Hook for retrieving a user account
 */
export const useAccount = () => {
  const client = useClient();

  return useQuery({
    queryKey: [ACCOUNT_BASE_KEY, client?.getUserId()],
    queryFn: async () => await getAccount(client),
  });
};
