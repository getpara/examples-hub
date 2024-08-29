import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { RotateApiKeyVars, rotateApiKey } from '../../../api/apiKeys/mutations';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';

export const useRotateKey = (
  options?: MutationOptions<string, Error, Omit<RotateApiKeyVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
