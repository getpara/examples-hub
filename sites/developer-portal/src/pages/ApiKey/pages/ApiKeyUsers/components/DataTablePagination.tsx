import {
  TablePagination,
  TablePaginationContent,
  TablePaginationEllipsis,
  TablePaginationItem,
  TablePaginationButton,
  TablePaginationNext,
  TablePaginationPrevious,
} from '@getpara/react-component-library';
import { Table as TTable } from '@tanstack/react-table';

interface DataTableProps<TData> {
  table: TTable<TData>;
}

export function DataTablePagination<TData>({ table }: DataTableProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex;
  const allPages = table.getPageOptions();

  const indNextPagesShown = currentPage + 3;
  const indPrevPagesShown = currentPage - 2;

  const nextPages = allPages.slice(currentPage, Math.min(indNextPagesShown, allPages.length));
  const prevPages = allPages.slice(Math.max(indPrevPagesShown, 0), currentPage);
  const shownPages = [...prevPages, ...nextPages];

  const showNextEllipsis = indNextPagesShown < allPages.length;
  const showPrevEllipsis = indPrevPagesShown > 0;

  return (
    <div className="para:p-4 para:flex para:items-end para:justify-center para:flex-1">
      <TablePagination>
        <TablePaginationContent>
          <TablePaginationItem>
            <TablePaginationPrevious disabled={!table.getCanPreviousPage()} onClick={table.previousPage} />
          </TablePaginationItem>
          {showPrevEllipsis && (
            <TablePaginationItem>
              <TablePaginationEllipsis />
            </TablePaginationItem>
          )}
          {shownPages.map(page => (
            <TablePaginationItem key={page}>
              <TablePaginationButton isActive={page === currentPage} onClick={() => table.setPageIndex(page)}>
                {page + 1}
              </TablePaginationButton>
            </TablePaginationItem>
          ))}
          {showNextEllipsis && (
            <TablePaginationItem>
              <TablePaginationEllipsis />
            </TablePaginationItem>
          )}
          <TablePaginationItem>
            <TablePaginationNext disabled={!table.getCanNextPage()} onClick={table.nextPage} />
          </TablePaginationItem>
        </TablePaginationContent>
      </TablePagination>
    </div>
  );
}
