import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ProjectResponse } from '../../../types/api';
import { createProject, CreateProjectVars } from '../../../api/projects/mutations';
import { PROJECTS_QUERY_KEY } from '../queries/useProjects';

export const useCreateProject = (
  options?: MutationOptions<ProjectResponse, Error, Omit<CreateProjectVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<ProjectResponse, Error, Omit<CreateProjectVars, 'organizationId'>, unknown>({
    mutationFn: vars => createProject({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY],
      });
    },
    ...options,
  });
};
