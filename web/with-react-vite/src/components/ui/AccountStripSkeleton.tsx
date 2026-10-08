import { AccountStripCell } from "@/components/ui/AccountStripCell";

interface AccountStripSkeletonProps {
  network: string;
  addressLabel?: string;
  networkLabel?: string;
  balanceLabel?: string;
  showsBalance?: boolean;
}

export function AccountStripSkeleton({
  network,
  addressLabel = "Account",
  networkLabel = "Network",
  balanceLabel = "Balance",
  showsBalance = true,
}: AccountStripSkeletonProps) {
  return (
    <section aria-label="Account" aria-busy="true" className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-sheet flex-wrap border-border md:min-h-[88px] md:flex-nowrap md:border-x max-md:*:basis-1/2 max-md:[&>*:first-child]:basis-full max-md:[&>*:nth-child(n+2)]:border-t max-md:[&>*:nth-child(2n+3)]:border-l md:[&>*+*]:border-l">
        <AccountStripCell label={addressLabel} isWide isBusy>
          <span aria-hidden="true" className="h-3 w-full max-w-70 bg-surface-muted" />
        </AccountStripCell>

        <AccountStripCell label={networkLabel}>
          <span className="truncate text-label">{network}</span>
        </AccountStripCell>

        {showsBalance && (
          <AccountStripCell label={balanceLabel} isBusy>
            <span aria-hidden="true" className="h-3 w-full max-w-24 bg-surface-muted" />
          </AccountStripCell>
        )}
      </div>
    </section>
  );
}
