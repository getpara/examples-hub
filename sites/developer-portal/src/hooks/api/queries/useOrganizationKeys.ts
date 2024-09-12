import { useQuery } from '@tanstack/react-query';
import { ApiKey } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeys } from '../../../api/apiKeys/queries';
import { Environment } from '../../../types/environment';
import { ENV_VARS } from '../../../utils/constants';

export const ORGANIZATIONS_KEYS_QUERY_KEY = 'organizationKeys';

export const useOrganizationKeysQuery = <T>(projectId: string, select: (data: ApiKey[]) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId,
    queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY, selectedOrganizationId, projectId],
    queryFn: async () => {
      if (!selectedOrganizationId || !projectId) {
        return [];
      }

      const { data } = await getApiKeys(selectedOrganizationId, projectId, ENV_VARS.environment);

      return data.keys;
    },
    select,
  });
};

export const useGetAllOrganizationKeys = (projectId: string) => {
  return useOrganizationKeysQuery(projectId, data => {
    return data;
  });
};

export const useGetOrganizationKey = (projectId: string, id: string, env: Environment) => {
  return useOrganizationKeysQuery(projectId, data => {
    return data.find(k => k.id === id && k.environment === env);
  });
};
