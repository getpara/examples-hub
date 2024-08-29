import { useQuery } from '@tanstack/react-query';
import { ApiKeyUsersLoginMetricsResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeyUsersLoginMetrics } from '../../../api/apiKeys/queries';

export const ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY = 'useOrganizationKeyUsersLoginMetrics';

export const useOrganizationKeyUsersLoginMetricsQuery = <T>(
  keyId: string,
  env: string,
  select: (data: ApiKeyUsersLoginMetricsResponse) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY, selectedOrganizationId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyUsersLoginMetrics(selectedOrganizationId ?? '', keyId, env);

      return data;
    },
    select,
  });
};

export const useOrganizationKeyUsersLoginMetrics = (keyId: string, env: string) => {
  return useOrganizationKeyUsersLoginMetricsQuery(keyId, env, data => {
    return data.percentLoginsByMethod;
  });
};
