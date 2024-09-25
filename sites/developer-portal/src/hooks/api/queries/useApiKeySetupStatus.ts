import { useQuery } from '@tanstack/react-query';
import { ApiKeySetupStatusResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeySetupStatus } from '../../../api/apiKeys/queries';

export const API_KEY_SETUP_STATUS_QUERY_KEY = 'setupStatus';

export const useApiKeySetupStatusQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeySetupStatusResponse | undefined) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId && !!keyId,
    queryKey: [API_KEY_SETUP_STATUS_QUERY_KEY, selectedOrganizationId, projectId, keyId, env],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return undefined;
      }

      const { data } = await getApiKeySetupStatus(selectedOrganizationId, projectId, keyId, env);

      return data;
    },
    select,
  });
};

export const useGetApiKeySetupStatus = (projectId: string, keyId: string, env: string) => {
  return useApiKeySetupStatusQuery(projectId, keyId, env, data => {
    return data;
  });
};
