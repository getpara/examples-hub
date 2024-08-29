import { useMemo, useState } from 'react';
import { Table, TableData } from '../../../components/Table/Table';
import { formatDate } from '../../../utils/formatDate';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { GradientButton } from '../../../components/common';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { RemoveMemberModal } from './RemoveMemberModal';
import { AddMemberModal } from './AddMemberModal';
import { useGetAllOrganizationMembers } from '../../../hooks/api/queries/useOrganizationMembers';
import { Loader } from '../../../components/Loader';

const PAGE_SIZE = 10;

export const MembersTable = () => {
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const { data: members, isLoading: isMembersLoading } = useGetAllOrganizationMembers();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRemoveMemberClick = (MemberId: string, MemberEmail: string) => () => {
    setSelectedMemberId(MemberId);
    setSelectedMemberEmail(MemberEmail);
  };

  const handleCloseRemoveMemberModal = () => {
    setSelectedMemberId('');
  };

  const handleRemoveMemberModalExited = () => {
    setSelectedMemberEmail('');
  };

  const handleCreateClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setIsAddModalOpen(false);
  };

  const totalPages = Math.ceil((members?.length ?? 0) / PAGE_SIZE);

  const formattedData: TableData[] = useMemo(
    () =>
      members?.map(
        d =>
          ({
            key: d.id,
            data: [
              {
                key: 'name',
                value: d.user?.name ?? '',
              },
              {
                key: 'email',
                value: d.user?.email ?? d.pendingEmail ?? '',
              },
              {
                key: 'joinedAt',
                value: d.joinedAt ? formatDate(d.joinedAt) : 'Pending',
              },
              {
                key: 'delete',
                value: (
                  <CpslButton
                    variant="destructive"
                    size="small"
                    onClick={handleRemoveMemberClick(d.id, d.user?.email ?? d.pendingEmail)}
                    disabled={d.owner}
                  >
                    Remove
                  </CpslButton>
                ),
                fitWidth: true,
              },
            ],
          }) as TableData,
      ) ?? [],
    [members],
  );

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  if (isMembersLoading) {
    return <Loader />;
  }

  return (
    <>
      <Table
        page={page}
        totalPages={totalPages}
        title="Members"
        subtitle="These are the people that currently have access to your Capsule instance"
        data={formattedData}
        onPageChange={handlePageChange}
        headers={[{ headerName: 'Name' }, { headerName: 'Email' }, { headerName: 'Date Joined', colSpan: 2 }]}
        ActionButton={
          <GradientButton onClick={handleCreateClick} size={isMobile ? 'small' : 'medium'}>
            <CpslIcon slot="start" icon="plusCircle" />
            Invite Member
          </GradientButton>
        }
        noContentTitle="No Members Yet"
      />
      <RemoveMemberModal
        open={!!selectedMemberId}
        onClose={handleCloseRemoveMemberModal}
        onExited={handleRemoveMemberModalExited}
        memberId={selectedMemberId}
        memberEmail={selectedMemberEmail}
      />
      <AddMemberModal open={isAddModalOpen} onClose={handleCloseAddMemberModal} />
    </>
  );
};
