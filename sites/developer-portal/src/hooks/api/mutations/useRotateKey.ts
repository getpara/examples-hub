import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { RotateApiKeyVars, rotateApiKey } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { useParams } from 'react-router-dom';

export const useRotateKey = (
  options?: MutationOptions<string, Error, Omit<RotateApiKeyVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<string, Error, Omit<RotateApiKeyVars, 'organizationId'>, unknown>({
    mutationFn: vars => rotateApiKey({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY],
      });
    },
    ...options,
  });
};
