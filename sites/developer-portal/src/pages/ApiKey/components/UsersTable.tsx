import { useMemo, useState } from 'react';
import { Table, TableData } from '../../../components/Table/Table';
import { formatDate } from '../../../utils/formatDate';
import { CpslButton } from '@usecapsule/react-components';
import { useParams } from 'react-router-dom';
import { Environment } from '../../../types/environment';
import { DeleteUserModal } from './DeleteUserModal';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import {
  useOrganizationKeyUsersTableData,
  useOrganizationKeyUsersTotalRows,
} from '../../../hooks/api/queries/useOrganizationKeyUsersTableData';
import { Loader } from '../../../components/Loader';
import { formatWalletAddress } from '../utils/formatWalletAddress';

const PAGE_SIZE = 25;

export const UsersTable = () => {
  const [page, setPage] = useState(0);
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const offset = page * PAGE_SIZE;
  const limit = PAGE_SIZE;

  const { data: users, isLoading: isUsersLoading } = useOrganizationKeyUsersTableData(
    projectId ?? '',
    apiKey ?? '',
    env ?? '',
    offset,
    limit,
  );
  const { data: totalUsersRows } = useOrganizationKeyUsersTotalRows(projectId ?? '', apiKey ?? '', env ?? '', offset, limit);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const handleDeleteUserClick = (userId: string, userEmail: string) => () => {
    setSelectedUserId(userId);
    setSelectedUserEmail(userEmail);
  };

  const handleCloseDeleteUserModal = () => {
    setSelectedUserId('');
  };

  const handleDeleteUserModalExited = () => {
    setSelectedUserEmail('');
  };

  const isProdKey = apiKeyData?.environment === Environment.PROD;

  const totalPages = Math.ceil((totalUsersRows ?? 0) / PAGE_SIZE);

  const formattedData: TableData[] = useMemo(
    () =>
      users?.map(d => {
        const walletAddress = d.walletAddresses.filter(w => !!w)?.[0] ?? '';

        return {
          key: d.userId,
          data: [
            {
              key: 'userId',
              value: d.userId,
            },
            {
              key: 'identifier',
              value: d.email ?? d.phoneNumber ?? d.farcasterUsername ?? d.userId,
            },
            {
              key: 'lastMethod',
              value: d.lastMethod,
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
            ...(!isProdKey
              ? [
                  {
                    key: 'delete',
                    value: (
                      <CpslButton
                        variant="secondary"
                        size="small"
                        onClick={handleDeleteUserClick(
                          d.userId,
                          d.email ?? d.phoneNumber ?? d.farcasterUsername ?? d.userId,
                        )}
                      >
                        Delete
                      </CpslButton>
                    ),
                    fitWidth: true,
                  },
                ]
              : []),
          ],
        } as TableData;
      }) ?? [],
    [isProdKey, users],
  );

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  if (isUsersLoading) {
    return <Loader />;
  }

  return (
    <>
      <Table
        page={page}
        title="Users"
        subtitle="Some description of the table goes here"
        data={formattedData}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        headers={[
          { headerName: 'UUID' },
          { headerName: 'Identifier' },
          { headerName: 'Last Login' },
          { headerName: 'Created' },
          { headerName: 'Last Seen' },
          { headerName: 'Total Logins' },
          { headerName: 'Address', colSpan: !isProdKey ? 2 : 1 },
        ]}
        noContentTitle="No Users Yet"
        noContentSubtitle="Some Subtitle"
      />
      <DeleteUserModal
        open={!!selectedUserId}
        onClose={handleCloseDeleteUserModal}
        onExited={handleDeleteUserModalExited}
        userId={selectedUserId}
        userEmail={selectedUserEmail}
      />
    </>
  );
};
