import { useQuery } from '@tanstack/react-query';
import { Project } from '../../../types/api';
import { getProjects } from '../../../api/projects/queries';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';
import { useGetSelectedOrganization } from './useOrganizations';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';

export const PROJECTS_QUERY_KEY = 'projects';

export const useProjectsQuery = <T>(select: (data: Project[]) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const { data: org } = useGetSelectedOrganization();

  return useQuery({
    enabled: isOrgValid,
    queryKey: [PROJECTS_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data } = await getProjects(organizationId);

      for (const project of data.projects) {
        if (!project.iconUrl) {
          project.iconUrl = org?.logoUrl;
        }
        if (!project.framework) {
          project.framework = Framework.REACT; // Default to React if no framework is set
        }
        if (!project.packageManager) {
          project.packageManager = PackageManager.YARN; // Default to YARN if no package manager is set
        }
      }

      return data.projects;
    },
    select,
  });
};

export const useGetAllProjects = () => {
  return useProjectsQuery(data => {
    return data.sort((a, b) => (a.archived && b.archived ? 0 : a.archived ? 1 : -1));
  });
};

export const useGetAllActiveProjects = () => {
  return useProjectsQuery(data => {
    return data.filter(p => !p.archived);
  });
};

export const useGetProject = (projectId: string) => {
  return useProjectsQuery(data => {
    return data.find(p => p.id === projectId);
  });
};
