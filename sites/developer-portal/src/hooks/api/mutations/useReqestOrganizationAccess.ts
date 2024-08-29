import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { requestOrganizationAccess } from '../../../api/users/mutations';
import { capsule } from '../../../clients/capsule';

export const useRequestOrganizationAccess = (options?: MutationOptions) => {
  const userId = capsule.getUserId();

  return useMutation({
    mutationFn: () => requestOrganizationAccess(userId ?? ''),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
