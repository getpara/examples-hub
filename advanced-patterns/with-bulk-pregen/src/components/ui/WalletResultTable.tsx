import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type { WalletResultStatus } from "@/lib/pregenWalletApi";

export interface WalletResultRow {
  key: string;
  handle: string;
  typeLabel: string;
  walletAddress: string;
  walletAddressLabel: string;
  status: WalletResultStatus;
  errorMessage?: string;
}

interface WalletResultTableProps {
  caption: string;
  rows: WalletResultRow[];
}

const HEADER_CELL_CLASS = "px-4 py-3 text-left font-mono text-mono-label font-medium text-muted uppercase";

const STATUS_BADGES: Record<WalletResultStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pending", variant: "accent" },
  success: { label: "Created", variant: "success" },
  failed: { label: "Failed", variant: "outline" },
};

export function WalletResultTable({ caption, rows }: WalletResultTableProps) {
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
            <th scope="col" className={HEADER_CELL_CLASS}>
              Wallet address
            </th>
            <th scope="col" className={HEADER_CELL_CLASS}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.key} data-status={row.status} className="align-top">
              <td className="px-4 py-3 font-mono text-code [overflow-wrap:anywhere]">{row.handle}</td>
              <td className="px-4 py-3 text-label whitespace-nowrap">{row.typeLabel}</td>
              <td title={row.walletAddress || undefined} data-address={row.walletAddress} className="px-4 py-3 font-mono text-code whitespace-nowrap">
                {row.walletAddress ? row.walletAddressLabel : <span className="text-muted">None</span>}
              </td>
              <td className="grid justify-items-start gap-2 px-4 py-3">
                <Badge variant={STATUS_BADGES[row.status].variant}>{STATUS_BADGES[row.status].label}</Badge>
                {row.errorMessage && (
                  <span className="text-caption text-destructive [overflow-wrap:anywhere]">{row.errorMessage}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
