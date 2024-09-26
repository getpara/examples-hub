import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ChangePlanVars, upgradePlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';

export const useUpgradePlan = (
  options?: MutationOptions<boolean, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<boolean, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>({
    mutationFn: vars => upgradePlan({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
