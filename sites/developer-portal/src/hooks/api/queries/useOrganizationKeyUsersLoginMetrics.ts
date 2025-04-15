import { useQuery } from '@tanstack/react-query';
import { ApiKeyUsersLoginMetricsResponse } from '../../../types/api';
import { getApiKeyUsersLoginMetrics } from '../../../api/apiKeys/queries';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';

export const ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY = 'organizationKeyUsersLoginMetrics';

export const useOrganizationKeyUsersLoginMetricsQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeyUsersLoginMetricsResponse) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [ORGANIZATIONS_KEY_USERS_LOGIN_METRICS_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyUsersLoginMetrics(organizationId ?? '', projectId, keyId, env);

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
