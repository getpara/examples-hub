import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { cancelPlan } from '../../../api/oganizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';

export const useCancelPlan = (options?: MutationOptions<boolean, Error, null, unknown>) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
