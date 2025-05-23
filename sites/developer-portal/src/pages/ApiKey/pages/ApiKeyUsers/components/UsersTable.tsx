import { useEffect, useState } from 'react';
import {
  useOrganizationKeyUsersTableData,
  useOrganizationKeyUsersTotalRows,
  usePrefetchOrganizationKeyUsersTableDataQuery,
} from '../../../../../hooks/api/queries/useOrganizationKeyUsersTableData';
import { getColumns } from './Columns';
import { useParams } from 'react-router-dom';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { UsersTableData } from '../../../../../types/api';
import { LoginMethod } from '../../../../../types/loginMethod';
import { DataTable } from '../../../../../components/DataTable/DataTable';

const PAGE_SIZE = 25;

const LOADING_DATA: UsersTableData[] = new Array(PAGE_SIZE).fill({
  id: '',
  email: '',
  lastMethod: '',
  firstCreated: new Date(),
  walletAddresses: [] as string[],
} as UsersTableData);

type UsersTableProps = {
  methods?: LoginMethod[];
};

export const UsersTable = ({ methods }: UsersTableProps) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: PAGE_SIZE, //default page size
  });
  const { apiKey, env, projectId } = useParams();

  const offset = pagination.pageIndex * pagination.pageSize;
  const limit = pagination.pageSize;

  const { data: users, isLoading: isUsersLoading } = useOrganizationKeyUsersTableData(
    projectId ?? '',
    apiKey ?? '',
    env ?? '',
    offset,
    limit,
    methods,
  );
  const { data: totalUsersRows } = useOrganizationKeyUsersTotalRows(
    projectId ?? '',
    apiKey ?? '',
    env ?? '',
    0,
    limit,
    methods,
  );
  const { prefetch } = usePrefetchOrganizationKeyUsersTableDataQuery(projectId ?? '', apiKey ?? '', env ?? '', methods);

  // Preload next queries
  useEffect(() => {
    const nextOffsets = [(pagination.pageIndex + 1) * pagination.pageSize, (pagination.pageIndex + 2) * pagination.pageSize];

    nextOffsets.forEach(offset => prefetch(offset, pagination.pageSize));
  }, [pagination.pageIndex, pagination.pageSize, prefetch]);

  // Reset pagination when methods change
  useEffect(() => {
    setPagination({
      pageIndex: 0, //initial page index
      pageSize: PAGE_SIZE, //default page size
    });
  }, [methods]);

  const table = useReactTable({
    data: isUsersLoading ? LOADING_DATA : (users ?? []),
    columns: getColumns(isUsersLoading),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: totalUsersRows,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <DataTable
      table={table}
      className="para:h-[calc(100vh-var(--appbar-height-mobile)-64px-36px-32px-36px)] para:lg:h-[calc(100vh-var(--appbar-height)-64px-36px-32px-36px)]"
    />
  );
};
