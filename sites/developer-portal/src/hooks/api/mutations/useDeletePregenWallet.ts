import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { DeletePregenWalletVars, deletePregenWallet } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY } from '../queries/useOrganizationKeyUsersTableData';
import { ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY } from '../queries/useOrganizationKeyUsersLoginMetrics';
import { useParams } from 'react-router-dom';

export const useDeletePregenWallet = (
  options?: MutationOptions<boolean, Error, Omit<DeletePregenWalletVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<DeletePregenWalletVars, 'organizationId'>, unknown>({
    mutationFn: vars => deletePregenWallet({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY],
      });
    },
    ...options,
  });
};
