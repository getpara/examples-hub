import { useQuery } from '@tanstack/react-query';
import { OrganizationMember } from '../../../types/api';
import { getOrganizationMembers } from '../../../api/organizationMembers/queries';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';
import { useGetAllProjects } from './useProjects';

export const ORGANIZATION_MEMBERS_QUERY_KEY = 'organizationMembers';

export const useOrganizationMembersQuery = <T>(select: (data: OrganizationMember[]) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const { data: projects } = useGetAllProjects();

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId, projects],
    queryFn: async () => {
      const { data } = await getOrganizationMembers(organizationId ?? '');

      // Sort projects to match the return from the main projects list
      if (projects) {
        const projectOrder = projects.map(p => p.id);
        data.members.forEach(member => {
          if (member.projects) {
            member.projects = [...member.projects].sort((a, b) => projectOrder.indexOf(a.id) - projectOrder.indexOf(b.id));
          }
        });
      }

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
