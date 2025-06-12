import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from '@getpara/react-component-library';
import { flexRender, Row, Table as TTable } from '@tanstack/react-table';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData> {
  table: TTable<TData>;
  className?: string;
  onRowClick?: (_: Row<TData>) => void;
  isLoading?: boolean;
  noResultsContent?: React.ReactNode;
}

export function DataTable<TData>({ table, className, onRowClick, noResultsContent, isLoading }: DataTableProps<TData>) {
  const hasData = !!table.getRowModel().rows.length;

  return (
    <div
      className={cn(
        'para:bg-background para:overflow-hidden para:border para:border-border para:rounded-lg para:flex para:flex-col para:min-h-[500px]',
        className,
      )}
    >
      <Table>
        <TableHeader className="para:bg-background para:sticky para:top-0">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {hasData &&
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="para:hover:bg-muted para:hover:cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="para:h-[72px]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {hasData && <DataTablePagination table={table} />}
      {!isLoading && !hasData && (
        <div className="para:size-full para:flex para:items-center para:justify-center para:flex-1">
          {noResultsContent ?? <Typography>No results.</Typography>}
        </div>
      )}
    </div>
  );
}
