import { useQuery } from '@tanstack/react-query';
import { UsersTableDataResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationUsersTableData } from '../../../api/organizations/queries';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationUsersTableData';

export const useOrganizationUsersTableDataQuery = <T>(
  env: string,
  select: (data: UsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, selectedOrganizationId, env, offset, limit],
    queryFn: async () => {
      const { data } = await getOrganizationUsersTableData(selectedOrganizationId ?? '', env, offset, limit);

      return data;
    },
    select,
  });
};

export const useOrganizationUsersTableData = (env: string, offset?: number, limit?: number) => {
  return useOrganizationUsersTableDataQuery(
    env,
    data => {
      return data.tableData;
    },
    offset,
    limit,
  );
};

export const useOrganizationUsersTotalRows = (env: string, offset?: number, limit?: number) => {
  return useOrganizationUsersTableDataQuery(
    env,
    data => {
      return data.totalRows;
    },
    offset,
    limit,
  );
};
