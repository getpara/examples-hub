import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { UpdateMemberVars, updateMember } from '../../../api/organizationMembers/mutations';
import { ORGANIZATION_MEMBERS_QUERY_KEY } from '../queries/useOrganizationMembers';
import { useParams } from 'react-router-dom';

export const useUpdateMember = (
  options?: MutationOptions<boolean, Error, Omit<UpdateMemberVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

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
