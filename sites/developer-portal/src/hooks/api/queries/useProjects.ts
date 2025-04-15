import { useQuery } from '@tanstack/react-query';
import { Project } from '../../../types/api';
import { getProjects } from '../../../api/projects/queries';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const PROJECTS_QUERY_KEY = 'projects';

export const useProjectsQuery = <T>(select: (data: Project[]) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
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

export const useGetProjectIsValid = (projectId?: string) => {
  return useProjectsQuery(data => {
    const project = data.find(p => p.id === projectId);
    return !!project && !project.archived;
  });
};
