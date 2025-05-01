import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@getpara/react-component-library';
import { flexRender, Table as TTable } from '@tanstack/react-table';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData> {
  table: TTable<TData>;
}

export function DataTable<TData>({ table }: DataTableProps<TData>) {
  return (
    <div className="para:bg-background para:overflow-hidden para:border para:border-border para:rounded-lg para:flex para:flex-col para:h-[calc(100vh-var(--appbar-height-mobile)-48px-36px-32px-36px)] para:lg:h-[calc(100vh-var(--appbar-height)-48px-36px-32px-36px)] para:min-h-[500px]">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
