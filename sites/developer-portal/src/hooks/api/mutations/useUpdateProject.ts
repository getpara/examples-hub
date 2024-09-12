import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useAppStore } from '../../../stores/app/useAppStore';
import { updateProject, UpdateProjectVars } from '../../../api/projects/mutations';
import { PROJECTS_QUERY_KEY } from '../queries/useProjects';

export const useUpdateProject = (
  options?: MutationOptions<boolean, Error, Omit<UpdateProjectVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<boolean, Error, Omit<UpdateProjectVars, 'organizationId'>, unknown>({
    mutationFn: vars => updateProject({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY],
      });
    },
    ...options,
  });
};
