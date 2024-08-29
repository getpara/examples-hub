import { useQuery } from '@tanstack/react-query';
import { ApiKey } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeys } from '../../../api/apiKeys/queries';
import { Environment } from '../../../types/environment';
import { ENV_VARS } from '../../../utils/constants';

export const ORGANIZATIONS_KEYS_QUERY_KEY = 'organizationKeys';

export const useOrganizationKeysQuery = <T>(select: (data: ApiKey[]) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY, , selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return [];
      }

      const { data } = await getApiKeys(selectedOrganizationId, ENV_VARS.environment);

      return data.keys;
    },
    select,
  });
};

export const useGetAllOrganizationKeys = () => {
  return useOrganizationKeysQuery(data => {
    return data;
  });
};

export const useGetOrganizationKey = (id: string, env: Environment) => {
  return useOrganizationKeysQuery(data => {
    return data.find(k => k.id === id && k.environment === env);
  });
};
