import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { cancelPlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useParams } from 'react-router-dom';

export const useCancelPlan = (options?: MutationOptions<boolean, Error, null, unknown>) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, null, unknown>({
    mutationFn: () => cancelPlan({ organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
