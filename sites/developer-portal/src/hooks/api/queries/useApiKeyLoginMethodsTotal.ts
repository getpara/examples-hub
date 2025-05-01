import { useQuery } from '@tanstack/react-query';
import { ApiKeyLoginMethodsTotalResponse } from '../../../types/api';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';
import { getApiKeyLoginMethodsTotal } from '../../../api/apiKeys/queries';
import { LOGIN_METHOD_CONFIG } from '../../../utils/constants';

export const API_KEY_LOGIN_METHODS_TOTAL_QUERY_KEY = 'apiKeyLoginMethodsTotal';

export const useApiKeyLoginMethodsTotalQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeyLoginMethodsTotalResponse) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [API_KEY_LOGIN_METHODS_TOTAL_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: async () => {
      const { data } = await getApiKeyLoginMethodsTotal(organizationId ?? '', projectId, keyId, env);

      const cleanedData: Record<string, (typeof data.data)[0]> = {};

      data.data.forEach(val => {
        const config = LOGIN_METHOD_CONFIG[val.method];

        if (config) {
          cleanedData[val.method] = val;
        } else {
          const otherVal = cleanedData.OTHER;

          if (!otherVal) {
            cleanedData.OTHER = { ...val, method: 'OTHER' };
          } else {
            cleanedData.OTHER = {
              ...otherVal,
              percent: otherVal.percent + val.percent,
              count: otherVal.count + val.count,
              userCount: otherVal.userCount + val.userCount,
            };
          }
        }
      });

      return { data: formatPercentTotalData(Object.values(cleanedData)) };
    },
    select,
  });
};

export const useApiKeyLoginMethodsTotal = (projectId: string, keyId: string, env: string) => {
  return useApiKeyLoginMethodsTotalQuery(projectId, keyId, env, data => {
    return data.data;
  });
};
