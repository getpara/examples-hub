import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SelectField } from "@/components/ui/SelectField";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  firstItem: number;
  lastItem: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  firstItem,
  lastItem,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <p className="text-caption text-muted">{`Showing ${firstItem}-${lastItem} of ${totalItems}`}</p>
      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Rows per page"
          className="w-36"
          value={String(pageSize)}
          options={pageSizeOptions.map((option) => ({ value: String(option), label: String(option) }))}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        />
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            icon={<Icon name="caret-left" className="size-icon-md" />}>
            Previous page
          </Button>
          <span className="min-w-24 text-center text-label tabular-nums">{`Page ${page} of ${pageCount}`}</span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            icon={<Icon name="caret-left" className="size-icon-md rotate-180" />}>
            Next page
          </Button>
        </nav>
      </div>
    </div>
  );
}
