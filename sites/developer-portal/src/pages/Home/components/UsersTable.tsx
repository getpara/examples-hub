import { useMemo, useState } from 'react';
import { Table, TableData } from '../../../components/Table/Table';
import { formatDate } from '../../../utils/formatDate';
import { Loader } from '../../../components/Loader';
import { LOGIN_METHOD_LABELS } from '../../../utils/constants';
import { formatWalletAddress } from '../../ApiKey/utils/formatWalletAddress';
import {
  useOrganizationUsersTableData,
  useOrganizationUsersTotalRows,
} from '../../../hooks/api/queries/useOrganizationUsersTableData';
import { Environment } from '../../../types/environment';

const PAGE_SIZE = 25;

export const UsersTable = () => {
  const [page, setPage] = useState(0);

  const offset = page * PAGE_SIZE;
  const limit = PAGE_SIZE;

  const { data: users, isLoading: isUsersLoading } = useOrganizationUsersTableData(Environment.DEV, offset, limit);
  const { data: totalUsersRows } = useOrganizationUsersTotalRows(Environment.DEV, offset, limit);

  const totalPages = Math.ceil((totalUsersRows ?? 0) / PAGE_SIZE);

  const formattedData: TableData[] = useMemo(
    () =>
      users?.map(d => {
        const walletAddress = d.externalWalletAddress ?? d.walletAddresses?.filter(w => !!w)?.[0] ?? '';

        return {
          key: d.id,
          data: [
            {
              key: 'userId',
              value: d.userId,
            },
            {
              key: 'identifier',
              value: d.email ?? d.phoneNumber ?? d.farcasterUsername ?? d.userId ?? d.pregenIdentifier,
            },
            {
              key: 'lastMethod',
              value: LOGIN_METHOD_LABELS[d.lastMethod],
            },
            {
              key: 'firstCreated',
              value: formatDate(d.firstCreated),
            },
            {
              key: 'lastSeen',
              value: formatDate(d.lastSeen),
            },
            {
              key: 'totalLogins',
              value: d.totalLogins,
            },
            {
              key: 'walletAddress',
              value: formatWalletAddress(walletAddress),
            },
          ],
        } as TableData;
      }) ?? [],
    [users],
  );

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  if (isUsersLoading) {
    return <Loader />;
  }

  return (
    <Table
      page={page}
      title="Users"
      subtitle="These are all the users who have logged into your app using your Capsule instance."
      data={formattedData}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      headers={[
        { headerName: 'UUID' },
        { headerName: 'Identifier' },
        { headerName: 'Last Login Method' },
        { headerName: 'Created' },
        { headerName: 'Last Seen' },
        { headerName: 'Total Logins' },
        { headerName: 'Address' },
      ]}
      noContentTitle="No Users Yet"
      noContentSubtitle="Some Subtitle"
    />
  );
};
