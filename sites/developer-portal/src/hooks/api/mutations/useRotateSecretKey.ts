import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { RotateSecretApiKeyVars, rotateSecretApiKey } from '../../../api/apiKeys/mutations';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { useParams } from 'react-router-dom';

export const useRotateSecretKey = (
  options?: MutationOptions<string, Error, Omit<RotateSecretApiKeyVars, 'organizationId'>, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<string, Error, Omit<RotateSecretApiKeyVars, 'organizationId'>, unknown>({
    mutationFn: vars => rotateSecretApiKey({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY],
      });
    },
    ...options,
  });
};
