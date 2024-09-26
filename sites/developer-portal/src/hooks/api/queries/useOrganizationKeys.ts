import { useQuery } from '@tanstack/react-query';
import { ApiKey } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeys } from '../../../api/apiKeys/queries';
import { Environment } from '../../../types/environment';
import { ENV_VARS } from '../../../utils/constants';
import { useCanCreateProdKeys } from '../../permissions/useCanCreateProdKeys';
import { useCallback } from 'react';

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

export const useGetAvailableKeyEnvs = (projectId: string) => {
  const { canCreateProdKeys } = useCanCreateProdKeys();

  return useOrganizationKeysQuery(
    projectId,
    useCallback(
      data => {
        const unArchivedKeys = data.filter(d => !d.archived);
        const availableOptions: Environment[] = [];

        switch (ENV_VARS.environment as Environment) {
          case Environment.PROD: {
            const hasProdKey = !!unArchivedKeys.find(d => d.environment === Environment.PROD);
            const hasBetaKey = !!unArchivedKeys.find(d => d.environment === Environment.BETA);

            if (!hasProdKey && canCreateProdKeys) {
              availableOptions.push(Environment.PROD);
            }
            if (!hasBetaKey) {
              availableOptions.push(Environment.BETA);
            }
            break;
          }
          case Environment.BETA: {
            const hasBetaKey = !!unArchivedKeys.find(d => d.environment === Environment.BETA);
            const hasSandboxKey = !!unArchivedKeys.find(d => d.environment === Environment.SANDBOX);

            if (!hasBetaKey && canCreateProdKeys) {
              availableOptions.push(Environment.BETA);
            }
            if (!hasSandboxKey) {
              availableOptions.push(Environment.SANDBOX);
            }
            break;
          }
          default: {
            const hasKey = !!unArchivedKeys.length;

            if (!hasKey) {
              availableOptions.push(ENV_VARS.environment as Environment);
            }
            break;
          }
        }

        return availableOptions;
      },
      [canCreateProdKeys],
    ),
  );
};
