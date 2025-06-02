import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { useParams } from 'react-router-dom';
import { archiveProject, ArchiveProjectVars } from '../../../api/projects/mutations';
import { PROJECTS_QUERY_KEY } from '../queries/useProjects';

export const useArchiveProject = (
  options?: MutationOptions<boolean, Error, Omit<ArchiveProjectVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<ArchiveProjectVars, 'organizationId'>, unknown>({
    mutationFn: vars => archiveProject({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [PROJECTS_QUERY_KEY],
      });
    },
    ...options,
  });
};
