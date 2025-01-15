import { useQuery } from '@tanstack/react-query';
import { UsersTableDataResponse } from '../../../types/api';
import { getApiKeyUsersTableData } from '../../../api/apiKeys/queries';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationKeyUsersTableData';

export const useOrganizationKeyUsersTableDataQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: UsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId && !!projectId,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, organizationId, projectId, keyId, env, offset, limit],
    queryFn: async () => {
      const { data } = await getApiKeyUsersTableData(organizationId ?? '', projectId, keyId, env, offset, limit);

      return data;
    },
    select,
  });
};

export const useOrganizationKeyUsersTableData = (
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
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
  );
};

export const useOrganizationKeyUsersTotalRows = (
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
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
  );
};
