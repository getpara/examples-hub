import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ArchiveApiKeyVars, archiveApiKey } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { useParams } from 'react-router-dom';

export const useArchiveKey = (
  options?: MutationOptions<boolean, Error, Omit<ArchiveApiKeyVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<boolean, Error, Omit<ArchiveApiKeyVars, 'organizationId'>, unknown>({
    mutationFn: vars => archiveApiKey({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY],
      });
    },
    ...options,
  });
};
