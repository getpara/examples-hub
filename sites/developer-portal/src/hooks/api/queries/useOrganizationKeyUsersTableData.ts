import { useQuery } from '@tanstack/react-query';
import { UsersTableDataResponse } from '../../../types/api';
import { getApiKeyUsersTableData } from '../../../api/apiKeys/queries';
import { useParams } from 'react-router-dom';
import { useIsValidKey, useIsValidOrg, useIsValidProject } from '../../useIsValidOrgConfig';
import { queryClient } from '../../../clients/queryClient';
import { LoginMethod } from '../../../types/loginMethod';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationKeyUsersTableData';

export const useOrganizationKeyUsersTableDataQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: UsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
  methods?: LoginMethod[],
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  return useQuery({
    enabled: isOrgValid && isProjectValid && isKeyValid,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, organizationId, projectId, keyId, env, offset, limit, methods],
    queryFn: async () => {
      const { data } = await getApiKeyUsersTableData(organizationId ?? '', projectId, keyId, env, offset, limit, methods);

      return data;
    },
    select,
  });
};

export const usePrefetchOrganizationKeyUsersTableDataQuery = (
  projectId: string,
  keyId: string,
  env: string,
  methods?: LoginMethod[],
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);
  const isProjectValid = useIsValidProject(projectId);
  const isKeyValid = useIsValidKey(projectId, keyId);

  const prefetch = async (offset?: number, limit?: number) => {
    if (isOrgValid && isProjectValid && isKeyValid) {
      // The results of this query will be cached like a normal query
      await queryClient.prefetchQuery({
        queryKey: [
          ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY,
          organizationId,
          projectId,
          keyId,
          env,
          offset,
          limit,
          methods,
        ],
        queryFn: async () => {
          const { data } = await getApiKeyUsersTableData(
            organizationId ?? '',
            projectId,
            keyId,
            env,
            offset,
            limit,
            methods,
          );

          return data;
        },
      });
    }
  };

  return { prefetch };
};

export const useOrganizationKeyUsersTableData = (
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
  methods?: LoginMethod[],
) => {
  return useOrganizationKeyUsersTableDataQuery(
    projectId,
    keyId,
    env,
    data => {
      return data.tableData;
    },
    offset,
    limit,
    methods,
  );
};

export const useOrganizationKeyUsersTotalRows = (
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
  methods?: LoginMethod[],
) => {
  return useOrganizationKeyUsersTableDataQuery(
    projectId,
    keyId,
    env,
    data => {
      return data.totalRows;
    },
    offset,
    limit,
    methods,
  );
};
