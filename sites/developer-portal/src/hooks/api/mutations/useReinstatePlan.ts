import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { reinstatePlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useParams } from 'react-router-dom';
import { ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY } from '../queries/useOrganizationSubscription';

export const useReinstatePlan = (options?: MutationOptions<{ success: boolean }, Error, null, unknown>) => {
  const { organizationId } = useParams();

  return useMutation<{ success: boolean }, Error, null, unknown>({
    mutationFn: () => reinstatePlan({ organizationId: organizationId ?? '' }),
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
