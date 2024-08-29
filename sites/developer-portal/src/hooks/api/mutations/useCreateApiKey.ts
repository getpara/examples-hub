import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { CreateApiKeyVars, createApiKey } from '../../../api/apiKeys/mutations';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { ApiKeyResponse } from '../../../types/api';

export const useCreateApiKey = (
  options?: MutationOptions<ApiKeyResponse, Error, Omit<CreateApiKeyVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<ApiKeyResponse, Error, Omit<CreateApiKeyVars, 'organizationId'>, unknown>({
    mutationFn: vars => createApiKey({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY],
      });
    },
    ...options,
  });
};
