import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { OrganizationResponse } from '../../../types/api';
import { createOrganization, CreateOrganizationVars } from '../../../api/users/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useAccount } from '@getpara/react-sdk';

export const useCreateOrganization = (
  options?: MutationOptions<OrganizationResponse, Error, Omit<CreateOrganizationVars, 'userId'>, unknown>,
) => {
  const { data: account } = useAccount();
  const userId = account?.userId;

  return useMutation<OrganizationResponse, Error, Omit<CreateOrganizationVars, 'userId'>, unknown>({
    mutationFn: vars => createOrganization({ ...vars, userId: userId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
