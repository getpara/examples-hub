import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ArchiveApiKeyVars, archiveApiKey } from '../../../api/apiKeys/mutations';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';

export const useArchiveKey = (
  options?: MutationOptions<boolean, Error, Omit<ArchiveApiKeyVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
