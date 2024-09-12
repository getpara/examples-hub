import { useQuery } from '@tanstack/react-query';
import { ApiKeyUsersTableDataResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeyUsersTableData } from '../../../api/apiKeys/queries';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationKeyUsersTableData';

export const useOrganizationKeyUsersTableDataQuery = <T>(
  projectId: string,
  keyId: string,
  env: string,
  select: (data: ApiKeyUsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!projectId,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, selectedOrganizationId, projectId, keyId, env, offset, limit],
    queryFn: async () => {
      const { data } = await getApiKeyUsersTableData(selectedOrganizationId ?? '', projectId, keyId, env, offset, limit);

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
