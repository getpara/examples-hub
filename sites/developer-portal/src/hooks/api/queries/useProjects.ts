import { useQuery } from '@tanstack/react-query';
import { Project } from '../../../types/api';
import { getProjects } from '../../../api/projects/queries';
import { useAppStore } from '../../../stores/app/useAppStore';

export const PROJECTS_QUERY_KEY = 'projects';

export const useProjectsQuery = <T>(select: (data: Project[]) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [PROJECTS_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return [];
      }

      const { data } = await getProjects(selectedOrganizationId);

      return data.projects;
    },
    select,
  });
};

export const useGetAllProjects = () => {
  return useProjectsQuery(data => {
    return data;
  });
};

export const useGetProject = (projectId: string) => {
  return useProjectsQuery(data => {
    return data.find(p => p.id === projectId);
  });
};
