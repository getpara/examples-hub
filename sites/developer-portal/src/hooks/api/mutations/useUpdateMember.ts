import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { UpdateMemberVars, updateMember } from '../../../api/organizationMembers/mutations';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/useOrganizationMembers';

export const useUpdateMember = (
  options?: MutationOptions<boolean, Error, Omit<UpdateMemberVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<boolean, Error, Omit<UpdateMemberVars, 'organizationId'>, unknown>({
    mutationFn: vars => updateMember({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY],
      });
    },
    ...options,
  });
};
