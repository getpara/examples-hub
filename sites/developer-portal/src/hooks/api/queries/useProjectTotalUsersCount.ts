import { useQuery } from '@tanstack/react-query';
import { getProjectTotalUsers } from '../../../api/projects/queries';
import { useAppStore } from '../../../stores/app/useAppStore';

export const PROJECTS_TOTAL_USERS_QUERY_KEY = 'projectsTotalUsers';

export const useProjectTotalUsersCountQuery = <T>(projectId: string, select: (data: number) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [PROJECTS_TOTAL_USERS_QUERY_KEY, selectedOrganizationId, projectId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return 0;
      }

      const { data } = await getProjectTotalUsers(selectedOrganizationId, projectId);

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
