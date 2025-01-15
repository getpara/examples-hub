import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { RemoveMemberVars, removeMember } from '../../../api/organizationMembers/mutations';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/useOrganizationMembers';
import { useParams } from 'react-router-dom';

export const useRemoveMember = (
  options?: MutationOptions<boolean, Error, Omit<RemoveMemberVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<RemoveMemberVars, 'organizationId'>, unknown>({
    mutationFn: vars => removeMember({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY],
      });
    },
    ...options,
  });
};
