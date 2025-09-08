import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';
import { getLinkedAccounts } from '../../actions/index.js';
import { CoreMethodParams } from '@getpara/web-sdk';
import { useAccount } from './useAccount.js';

export const LINKED_ACCOUNTS_BASE_KEY = 'PARA_LINKED_ACCOUNTS';

/**
 * Hook for returning the linked accounts of the user.
 * @param params - Optional parameters for fetching linked accounts.
 *   - withMetadata (boolean): Whether to include metadata for each linked account. Defaults to false.
 * @returns A query object containing the linked accounts array and query status.
 */
export const useLinkedAccounts = (params: CoreMethodParams<'getLinkedAccounts'> = { withMetadata: false }) => {
  const client = useInternalClient();
  const { connectionType } = useAccount();

  return useQuery({
    enabled: !!client?.isReady && ['both', 'embedded'].includes(connectionType),
    queryKey: [LINKED_ACCOUNTS_BASE_KEY, client?.userId ?? null, connectionType, params],
    queryFn: async () => (await getLinkedAccounts(client, params)) ?? [],
  });
};
