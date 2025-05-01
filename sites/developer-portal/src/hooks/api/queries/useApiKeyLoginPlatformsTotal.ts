import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginPlatformsTotalResponse } from '../../../types/api';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';
import { getApiKeyLoginPlatformsTotal } from '../../../api/apiKeys/queries';

export const API_KEY_LOGIN_PLATFORMS_TOTAL_QUERY_KEY = 'apiKeyLoginPlatformsTotal';

export const useApiKeyLoginPlatformsTotalQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: OrganizationLoginPlatformsTotalResponse) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [API_KEY_LOGIN_PLATFORMS_TOTAL_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyLoginPlatformsTotal(organizationId ?? '', projectId, keyId, env);

      return { data: formatPercentTotalData(data.data) };
    },
    select,
  });
};

export const useApiKeyLoginPlatformsTotal = (projectId: string, keyId: string, env: string) => {
  return useApiKeyLoginPlatformsTotalQuery(projectId, keyId, env, data => {
    return data.data;
  });
};
