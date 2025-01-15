import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { InviteMemberVars, inviteMember } from '../../../api/organizationMembers/mutations';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/useOrganizationMembers';
import { useParams } from 'react-router-dom';

export const useInviteMember = (
  options?: MutationOptions<boolean, Error, Omit<InviteMemberVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<InviteMemberVars, 'organizationId'>, unknown>({
    mutationFn: vars => inviteMember({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY],
      });
    },
    ...options,
  });
};
