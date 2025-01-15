import { useQuery } from '@tanstack/react-query';
import { OrganizationMember } from '../../../types/api';
import { getOrganizationMembers } from '../../../api/organizationMembers/queries';
import { useParams } from 'react-router-dom';

export const ORGANIZATION_MEMBERS_QUERY_KEY = 'organizationMembers';

export const useOrganizationMembersQuery = <T>(select: (data: OrganizationMember[]) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationMembers(organizationId ?? '');

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
