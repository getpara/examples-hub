import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { updateOrganization, UpdateOrganizationVars } from '../../../api/organizations/mutations';

export const useUpdateOrganization = (options?: MutationOptions<boolean, Error, UpdateOrganizationVars, unknown>) => {
  return useMutation<boolean, Error, UpdateOrganizationVars, unknown>({
    mutationFn: vars => updateOrganization(vars),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
