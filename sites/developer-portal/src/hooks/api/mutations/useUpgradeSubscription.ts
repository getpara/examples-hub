import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { upgradeSubscription, UpgradeSubscriptionVars } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY } from '../queries/useOrganizationSubscription';

export const useUpgradeSubscription = (
  options?: MutationOptions<{ success: boolean }, Error, Omit<UpgradeSubscriptionVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<{ success: boolean }, Error, Omit<UpgradeSubscriptionVars, 'organizationId'>, unknown>({
    mutationFn: vars => upgradeSubscription({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY],
      });
    },
    ...options,
  });
};
