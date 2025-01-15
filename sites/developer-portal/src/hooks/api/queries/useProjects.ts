import { useQuery } from '@tanstack/react-query';
import { Project } from '../../../types/api';
import { getProjects } from '../../../api/projects/queries';
import { useParams } from 'react-router-dom';

export const PROJECTS_QUERY_KEY = 'projects';

export const useProjectsQuery = <T>(select: (data: Project[]) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [PROJECTS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data } = await getProjects(organizationId);

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
