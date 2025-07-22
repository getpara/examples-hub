import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';
import { getLinkedAccounts } from '../../actions/index.js';
import { CoreMethodParams } from '@getpara/web-sdk';

export const LINKED_ACCOUNTS_BASE_KEY = 'PARA_LINKED_ACCOUNTS';

/**
 * Hook for returning the linked accounts of the user.
 * @param params - Optional parameters for fetching linked accounts.
 *   - withMetadata (boolean): Whether to include metadata for each linked account. Defaults to false.
 * @returns A query object containing the linked accounts array and query status.
 */
export const useLinkedAccounts = (params: CoreMethodParams<'getLinkedAccounts'> = { withMetadata: false }) => {
  const client = useInternalClient();

  return useQuery({
    enabled: !!client?.isReady,
    queryKey: [LINKED_ACCOUNTS_BASE_KEY, client?.userId ?? null, params],
    queryFn: async () => (await getLinkedAccounts(client, params)) ?? [],
  });
};
