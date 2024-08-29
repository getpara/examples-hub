import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { InviteMemberVars, inviteMember } from '../../../api/organizationMembers/mutations';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/useOrganizationMembers';

export const useInviteMember = (
  options?: MutationOptions<boolean, Error, Omit<InviteMemberVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
