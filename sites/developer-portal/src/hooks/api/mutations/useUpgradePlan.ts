import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ChangePlanVars, upgradePlan } from '../../../api/organizations/mutations';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { useParams } from 'react-router-dom';

export const useUpgradePlan = (
  options?: MutationOptions<boolean, Error, Omit<ChangePlanVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

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
