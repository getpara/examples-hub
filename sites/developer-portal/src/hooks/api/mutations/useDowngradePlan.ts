import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ChangePlanVars, downgradePlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';

export const useDowngradePlan = (
  options?: MutationOptions<boolean, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<boolean, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>({
    mutationFn: vars => downgradePlan({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
