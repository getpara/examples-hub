import { useQuery } from '@tanstack/react-query';
import { OrganizationMember } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationMembers } from '../../../api/organizationMembers/queries';

export const ORGANIZATION_MEMBERS_QUERY_KEY = 'organizationMembers';

export const useOrganizationMembersQuery = <T>(select: (data: OrganizationMember[]) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      const { data } = await getOrganizationMembers(selectedOrganizationId ?? '');

      return data.members;
    },
    select,
  });
};

export const useGetAllOrganizationMembers = () => {
  return useOrganizationMembersQuery(data => {
    return data;
  });
};
