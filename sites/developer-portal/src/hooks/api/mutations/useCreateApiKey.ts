import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { CreateApiKeyVars, createApiKey } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { ApiKeyResponse } from '../../../types/api';
import { useParams } from 'react-router-dom';

export const useCreateApiKey = (
  options?: MutationOptions<ApiKeyResponse, Error, Omit<CreateApiKeyVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

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
