import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { DeleteApiKeyUserVars, deleteApiKeyUser } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY } from '../queries/useOrganizationKeyUsersTableData';
import { ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY } from '../queries/useOrganizationKeyUsersLoginMetrics';
import { useParams } from 'react-router-dom';

export const useDeleteUser = (
  options?: MutationOptions<boolean, Error, Omit<DeleteApiKeyUserVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<DeleteApiKeyUserVars, 'organizationId'>, unknown>({
    mutationFn: vars => deleteApiKeyUser({ ...vars, organizationId: organizationId ?? '' }),
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
