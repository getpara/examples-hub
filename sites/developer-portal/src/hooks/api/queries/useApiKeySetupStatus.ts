import { useQuery } from '@tanstack/react-query';
import { ApiKeySetupStatusResponse } from '../../../types/api';
import { getApiKeySetupStatus } from '../../../api/apiKeys/queries';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';

export const API_KEY_SETUP_STATUS_QUERY_KEY = 'setupStatus';

export const useApiKeySetupStatusQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeySetupStatusResponse | undefined) => T,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [API_KEY_SETUP_STATUS_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: async () => {
      if (!organizationId) {
        return undefined;
      }

      const { data } = await getApiKeySetupStatus(organizationId, projectId, keyId, env);

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
