import { useQuery } from '@tanstack/react-query';
import { ApiKeyUsersTableDataResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getApiKeyUsersTableData } from '../../../api/apiKeys/queries';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationKeyUsersTableData';

export const useOrganizationKeyUsersTableDataQuery = <T>(
  keyId: string,
  env: string,
  select: (data: ApiKeyUsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, selectedOrganizationId, keyId, env, offset, limit],
    queryFn: async () => {
      const { data } = await getApiKeyUsersTableData(selectedOrganizationId ?? '', keyId, env, offset, limit);

      return data;
    },
    select,
  });
};

export const useOrganizationKeyUsersTableData = (keyId: string, env: string, offset?: number, limit?: number) => {
  return useOrganizationKeyUsersTableDataQuery(
    keyId,
    env,
    data => {
      return data.tableData;
    },
    offset,
    limit,
  );
};

export const useOrganizationKeyUsersTotalRows = (keyId: string, env: string, offset?: number, limit?: number) => {
  return useOrganizationKeyUsersTableDataQuery(
    keyId,
    env,
    data => {
      return data.totalRows;
    },
    offset,
    limit,
  );
};
