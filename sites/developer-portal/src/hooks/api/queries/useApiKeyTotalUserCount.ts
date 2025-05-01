import { useQuery } from '@tanstack/react-query';
import { ApiKeyTotalUserCountResponse } from '../../../types/api';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';
import { getApiKeyTotalUserCount } from '../../../api/apiKeys/queries';

export const API_KEY_TOTAL_USER_COUNT_QUERY_KEY = 'apiKeyTotalUserCount';

export const useApiKeyTotalUserCountQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeyTotalUserCountResponse) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [API_KEY_TOTAL_USER_COUNT_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyTotalUserCount(organizationId ?? '', projectId, keyId, env);

      return data;
    },
    select,
  });
};

export const useApiKeyTotalUserCount = (projectId: string, keyId: string, env: string) => {
  return useApiKeyTotalUserCountQuery(projectId, keyId, env, data => {
    return data;
  });
};
