import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface HandleTableRow {
  handle: string;
  typeLabel: string;
}

interface HandleTableProps {
  caption: string;
  rows: HandleTableRow[];
  disabled?: boolean;
  onRemove: (index: number) => void;
}

const HEADER_CELL_CLASS = "px-4 py-3 text-left font-mono text-mono-label font-medium text-muted uppercase";

export function HandleTable({ caption, rows, disabled = false, onRemove }: HandleTableProps) {
  return (
    <div className="overflow-x-auto border border-border bg-surface">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={HEADER_CELL_CLASS}>
              Handle
            </th>
            <th scope="col" className={HEADER_CELL_CLASS}>
              Type
            </th>
            <th scope="col" className={`${HEADER_CELL_CLASS} sr-only`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr key={`${row.handle}-${index}`}>
              <td className="px-4 py-2 font-mono text-code [overflow-wrap:anywhere]">{row.handle}</td>
              <td className="px-4 py-2 text-label whitespace-nowrap">{row.typeLabel}</td>
              <td className="py-1 pr-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                  icon={<Icon name="x" className="size-icon-md" />}>
                  {`Remove ${row.handle}`}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
