import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { UpdateApiKeyVars, updateApiKey } from '../../../api/apiKeys/mutations';
import { useAppStore } from '../../../stores/app/useAppStore';
import { ORGANIZATIONS_KEYS_QUERY_KEY } from '../queries/useOrganizationKeys';
import { API_KEY_SETUP_STATUS_QUERY_KEY } from '../queries/useApiKeySetupStatus';

export const useUpdateApiKey = (
  options?: MutationOptions<boolean, Error, Omit<UpdateApiKeyVars, 'organizationId'>, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<boolean, Error, Omit<UpdateApiKeyVars, 'organizationId'>, unknown>({
    mutationFn: vars => updateApiKey({ ...vars, organizationId: organizationId ?? '' }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [API_KEY_SETUP_STATUS_QUERY_KEY],
      });
    },
    ...options,
  });
};
