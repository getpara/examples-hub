import { useQuery } from '@tanstack/react-query';
import { ApiKey } from '../../../types/api';
import { getApiKeys } from '../../../api/apiKeys/queries';
import { Environment } from '../../../types/environment';
import { ENV_VARS } from '../../../utils/constants';
import { useCallback } from 'react';
import { useGetOrganizationSubscriptionPlan } from './useOrganizationSubscription';
import { useParams } from 'react-router-dom';
import { useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';

export const ORGANIZATIONS_KEYS_QUERY_KEY = 'organizationKeys';

export const useOrganizationKeysQuery = <T>(projectId: string, select: (data: ApiKey[]) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);

  return useQuery({
    enabled: isOrgValid && isProjectValid,
    queryKey: [ORGANIZATIONS_KEYS_QUERY_KEY, organizationId, projectId],
    queryFn: async () => {
      if (!organizationId || !projectId) {
        return [];
      }

      const { data } = await getApiKeys(organizationId, projectId, ENV_VARS.environment);

      return data.keys;
    },
    select,
  });
};

export const useGetAllOrganizationKeys = (projectId: string) => {
  return useOrganizationKeysQuery(projectId, data => {
    return data.sort((a, b) => (a.archived && b.archived ? 0 : a.archived ? 1 : -1));
  });
};

export const useGetOrganizationKey = (projectId: string, id: string, env: Environment) => {
  return useOrganizationKeysQuery(projectId, data => {
    return data.find(k => k.id === id && k.environment === env);
  });
};

export const useGetAvailableKeyEnv = (projectId: string) => {
  const { data: plan } = useGetOrganizationSubscriptionPlan();

  return useOrganizationKeysQuery(
    projectId,
    useCallback(
      data => {
        const unArchivedKeys = data.filter(d => !d.archived);
        const env = ENV_VARS.environment as Environment;
        const hasKey = !!unArchivedKeys.find(d => d.environment.toUpperCase() === env);

        const isProdOrBeta = env === Environment.PROD || env === Environment.BETA;

        if (!isProdOrBeta) {
          return env;
        }

        if (!hasKey && plan?.canCreateProdKeys) {
          return env;
        }
        return undefined;
      },
      [plan],
    ),
  );
};

export const useGetKeyIsValid = (projectId?: string, keyId?: string) => {
  return useOrganizationKeysQuery(projectId ?? '', data => {
    const key = data.find(k => k.id === keyId);
    return key;
  });
};
