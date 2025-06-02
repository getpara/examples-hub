import { useQuery } from '@tanstack/react-query';
import { OrganizationTotalUserCountByProjectResponse } from '../../../types/api';
import { getOrganizationTotalUserCountByProject } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const ORGANIZATIONS_TOTAL_USER_COUNT_BY_PROJECT_QUERY_KEY = 'organizationTotalUserCountByProject';

export const useOrganizationTotalUserCountByProjectQuery = <T>(
  select: (data: OrganizationTotalUserCountByProjectResponse['projectCounts']) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATIONS_TOTAL_USER_COUNT_BY_PROJECT_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationTotalUserCountByProject(organizationId ?? '');

      if (!data.projectCounts) {
        return [];
      }

      return data.projectCounts;
    },
    select,
  });
};

export const useOrganizationTotalUserCountByAllProjects = () => {
  return useOrganizationTotalUserCountByProjectQuery(data => {
    return data;
  });
};

export const useOrganizationTotalUserCountByProject = (projectId: string) => {
  return useOrganizationTotalUserCountByProjectQuery(data => {
    return data.find(project => project.projectId === projectId) ?? { projectId, count: 0, lowerEnvCount: 0 };
  });
};
