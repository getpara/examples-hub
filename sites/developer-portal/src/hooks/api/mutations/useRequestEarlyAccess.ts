import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { RequestEarlyAccessVars, requestEarlyAccess } from '../../../api/oganizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';

export const useRequestEarlyAccess = (
  options?: MutationOptions<boolean, Error, Omit<RequestEarlyAccessVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
