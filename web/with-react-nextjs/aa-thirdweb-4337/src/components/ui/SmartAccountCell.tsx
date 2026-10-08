import { AccountStripCell } from "@/components/ui/AccountStripCell";
import { Badge } from "@/components/ui/Badge";
import { shortenAddress } from "@/lib/format";

interface SmartAccountCellProps {
  address: string | null;
  label?: string;
  standard?: string;
  isLoading?: boolean;
  unavailableLabel?: string;
  addressTestId?: string;
}

export function SmartAccountCell({
  address,
  label = "Smart account",
  standard,
  isLoading = false,
  unavailableLabel = "Not available",
  addressTestId,
}: SmartAccountCellProps) {
  return (
    <AccountStripCell label={label} isMedium isBusy={isLoading}>
      {isLoading ? (
        <span aria-hidden="true" className="h-3 w-full max-w-70 bg-surface-muted" />
      ) : address ? (
        <>
          <span data-testid={addressTestId} title={address} className="truncate font-mono text-code">
            {shortenAddress(address)}
          </span>
          {standard && <Badge variant="outline">{standard}</Badge>}
        </>
      ) : (
        <span className="truncate text-label text-muted">{unavailableLabel}</span>
      )}
    </AccountStripCell>
  );
}
