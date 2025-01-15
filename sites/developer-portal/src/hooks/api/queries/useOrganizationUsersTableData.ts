import { useQuery } from '@tanstack/react-query';
import { UsersTableDataResponse } from '../../../types/api';
import { getOrganizationUsersTableData } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY = 'organizationUsersTableData';

export const useOrganizationUsersTableDataQuery = <T>(
  env: string,
  select: (data: UsersTableDataResponse) => T,
  offset?: number,
  limit?: number,
) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATIONS_KEY_USERS_TABLE_DATA_QUERY_KEY, organizationId, env, offset, limit],
    queryFn: async () => {
      const { data } = await getOrganizationUsersTableData(organizationId ?? '', env, offset, limit);

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
