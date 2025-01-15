import { useQuery } from '@tanstack/react-query';
import { getProjectTotalUsers } from '../../../api/projects/queries';
import { useParams } from 'react-router-dom';

export const PROJECTS_TOTAL_USERS_QUERY_KEY = 'projectsTotalUsers';

export const useProjectTotalUsersCountQuery = <T>(projectId: string, select: (data: number) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [PROJECTS_TOTAL_USERS_QUERY_KEY, organizationId, projectId],
    queryFn: async () => {
      if (!organizationId) {
        return 0;
      }

      const { data } = await getProjectTotalUsers(organizationId, projectId);

      return data.totalUsers;
    },
    select,
  });
};

export const useProjectTotalUsersCount = (projectId: string) => {
  return useProjectTotalUsersCountQuery(projectId, data => {
    return data;
  });
};
