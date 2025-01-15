import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { RequestEarlyAccessVars, requestEarlyAccess } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useParams } from 'react-router-dom';

export const useRequestEarlyAccess = (
  options?: MutationOptions<boolean, Error, Omit<RequestEarlyAccessVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<RequestEarlyAccessVars, 'organizationId'>, unknown>({
    mutationFn: vars => requestEarlyAccess({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
