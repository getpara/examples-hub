import { AccountStripCell } from "@/components/ui/AccountStripCell";

interface BalanceCellProps {
  label: string;
  value?: string;
  isLoading?: boolean;
  unavailableLabel?: string;
  testId?: string;
}

export function BalanceCell({ label, value, isLoading = false, unavailableLabel = "Unavailable", testId }: BalanceCellProps) {
  return (
    <AccountStripCell label={label} isBusy={isLoading}>
      {isLoading ? (
        <span aria-hidden="true" className="h-3 w-full max-w-24 bg-surface-muted" />
      ) : (
        <span data-testid={testId} className="truncate font-mono text-data tabular-nums">
          {value ?? unavailableLabel}
        </span>
      )}
    </AccountStripCell>
  );
}
