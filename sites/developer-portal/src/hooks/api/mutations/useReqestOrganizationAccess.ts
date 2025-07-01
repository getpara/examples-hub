import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { requestOrganizationAccess, RequestOrganizationAccessVars } from '../../../api/users/mutations';
import { OrganizationResponse } from '../../../types/api';
import { useAccount } from '@getpara/react-sdk';

export const useRequestOrganizationAccess = (
  options?: MutationOptions<OrganizationResponse, Error, Omit<RequestOrganizationAccessVars, 'userId'>, unknown>,
) => {
  const {
    embedded: { userId },
  } = useAccount();

  return useMutation<OrganizationResponse, Error, Omit<RequestOrganizationAccessVars, 'userId'>, unknown>({
    mutationFn: vars => requestOrganizationAccess({ ...vars, userId: userId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
