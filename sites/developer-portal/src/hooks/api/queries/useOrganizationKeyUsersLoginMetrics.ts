import { useQuery } from '@tanstack/react-query';
import { ApiKeyUsersLoginMetricsResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeyUsersLoginMetrics } from '../../../api/apiKeys/queries';

export const ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY = 'organizationKeyUsersLoginMetrics';

export const useOrganizationKeyUsersLoginMetricsQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeyUsersLoginMetricsResponse) => T,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId,
    queryKey: [ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY, selectedOrganizationId, projectId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyUsersLoginMetrics(selectedOrganizationId ?? '', projectId, keyId, env);

      return data;
    },
    select,
  });
};

export const useOrganizationKeyUsersLoginMetrics = (projectId: string, keyId: string, env: string) => {
  return useOrganizationKeyUsersLoginMetricsQuery(projectId, keyId, env, data => {
    return data.percentLoginsByMethod;
  });
};
