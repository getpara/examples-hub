import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useGetAllOrganizationMembers } from '../../../hooks/api/queries/useOrganizationMembers';
import { OrganizationMember, User } from '../../../types/api';
import { DataTable } from '../../../components/DataTable/DataTable';
import { getColumns } from './Columns';
import { MemberSheet } from './MemberSheet';
import { useState } from 'react';

const PAGE_SIZE = 25;

const LOADING_DATA: OrganizationMember[] = new Array(PAGE_SIZE).fill({
  id: '',
  email: '',
  joinedAt: new Date(),
  role: 'ORG_MEMBER',
  owner: false,
  permissions: [],
  user: {} as User,
} as OrganizationMember);

export const MembersTable = () => {
  const { data: members, isLoading: isMembersLoading } = useGetAllOrganizationMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleSheetClose = () => {
    setIsOpen(false);
    // Clear member after animation
    setTimeout(() => {
      setSelectedMemberId(undefined);
    }, 150);
  };

  const table = useReactTable({
    data: isMembersLoading ? LOADING_DATA : (members ?? []),
    columns: getColumns(isMembersLoading),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
  });

  return (
    <>
      <DataTable
        table={table}
        className="para:h-[calc(100vh-var(--appbar-height-mobile)-64px-36px-16px)] para:lg:h-[calc(100vh-var(--appbar-height)-64px-36px-16px)]"
        onRowClick={row => {
          setSelectedMemberId(row.original.id);
          setIsOpen(true);
        }}
      />
      <MemberSheet isOpen={isOpen} memberId={selectedMemberId} onClose={handleSheetClose} />
    </>
  );
};
