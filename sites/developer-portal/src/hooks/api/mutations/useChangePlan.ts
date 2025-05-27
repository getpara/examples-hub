import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ChangePlanVars, changePlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useParams } from 'react-router-dom';
import { ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY } from '../queries/useOrganizationSubscription';

export const useChangePlan = (
  options?: MutationOptions<{ success: boolean }, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<{ success: boolean }, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>({
    mutationFn: vars => changePlan({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      // Updating on a timeout to ensure the webhook has time to process
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [ORGANIZATIONS_QUERY_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY],
        });
      }, 5000);
    },
    ...options,
  });
};
