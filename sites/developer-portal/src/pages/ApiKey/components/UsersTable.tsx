import { useMemo, useState } from 'react';
import { Table, TableData } from '../../../components/Table/Table';
import { formatDate } from '../../../utils/formatDate';
import { CpslButton } from '@getpara/react-components';
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
import { LOGIN_METHOD_LABELS } from '../../../utils/constants';

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
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');

  const handleDeleteUserClick = (id: string, userEmail: string) => () => {
    setSelectedUserId(id);
    setSelectedUserEmail(userEmail);
  };

  const handleDeleteWalletClick = (id: string, pregenIdentifier: string) => () => {
    setSelectedWalletId(id);
    setSelectedUserEmail(pregenIdentifier);
  };

  const handleCloseDeleteUserModal = () => {
    setSelectedUserId('');
    setSelectedWalletId('');
  };

  const handleDeleteUserModalExited = () => {
    setSelectedUserEmail('');
  };

  const isProdKey = apiKeyData?.environment.toUpperCase() === Environment.PROD;

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
              value: d.userId ?? d.pregenWalletId,
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
            ...(!isProdKey
              ? [
                  {
                    key: 'delete',
                    value:
                      d.userId || d.pregenWalletId ? (
                        <CpslButton
                          variant="secondary"
                          size="small"
                          onClick={
                            d.pregenWalletId
                              ? handleDeleteWalletClick(d.pregenWalletId, d.pregenIdentifier ?? d.id)
                              : handleDeleteUserClick(
                                  d.userId!,
                                  d.email ??
                                    d.phoneNumber ??
                                    d.farcasterUsername ??
                                    d.userId ??
                                    d.pregenIdentifier ??
                                    d.pregenWalletId ??
                                    d.id,
                                )
                          }
                        >
                          Delete
                        </CpslButton>
                      ) : null,
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
        subtitle="These are all the users who have logged into your app using your Para instance."
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
          { headerName: 'Address', colSpan: !isProdKey ? 2 : 1 },
        ]}
        noContentTitle="No Users Yet"
      />
      <DeleteUserModal
        open={!!selectedUserId || !!selectedWalletId}
        onClose={handleCloseDeleteUserModal}
        onExited={handleDeleteUserModalExited}
        userId={selectedUserId}
        walletId={selectedWalletId}
        userEmail={selectedUserEmail}
      />
    </>
  );
};
