import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { DeleteApiKeyUsersVars, deleteApiKeyUsers } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY } from '../queries/useOrganizationKeyUsersTableData';
import { ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY } from '../queries/useOrganizationKeyUsersLoginMetrics';
import { useParams } from 'react-router-dom';
import { ORGANIZATIONS_TOTAL_USER_COUNT_BY_PROJECT_QUERY_KEY } from '../queries/useOrganizationTotalUserCountByProject';

export const useDeleteUsers = (
  options?: MutationOptions<boolean, Error, Omit<DeleteApiKeyUsersVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<DeleteApiKeyUsersVars, 'organizationId'>, unknown>({
    mutationFn: vars => deleteApiKeyUsers({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_TOTAL_USER_COUNT_BY_PROJECT_QUERY_KEY],
      });
    },
    ...options,
  });
};
