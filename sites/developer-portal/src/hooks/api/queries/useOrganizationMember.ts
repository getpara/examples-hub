import { useQuery } from '@tanstack/react-query';
import { OrganizationMember } from '../../../types/api';
import { getOrganizationMember } from '../../../api/users/queries';
import { capsule } from '../../../clients/capsule';
import { useAppStore } from '../../../stores/app/useAppStore';

export const ORGANIZATION_MEMBER_QUERY_KEY = 'organizationMember';

export const useOrganizationMemberQuery = <T>(select: (data: OrganizationMember | undefined) => T) => {
  const userId = capsule.getUserId();
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!userId && !!selectedOrganizationId,
    queryKey: [ORGANIZATION_MEMBER_QUERY_KEY, selectedOrganizationId, userId],
    queryFn: async () => {
      if (!userId || !selectedOrganizationId) {
        return undefined;
      }

      const { data } = await getOrganizationMember(userId, selectedOrganizationId);

      return data.member;
    },
    select,
  });
};

export const useOrganizationMember = () => {
  return useOrganizationMemberQuery(data => {
    return data;
  });
};
