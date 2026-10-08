import type { ReactNode } from "react";
import { AccountStripCell } from "@/components/ui/AccountStripCell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

interface AccountStripProps {
  address: string;
  addressLabel?: string;
  addressBadge?: string;
  addressCopyStatus?: CopyStatus;
  onCopyAddress?: () => void;
  network: string;
  networkLabel?: string;
  balance?: string;
  balanceLabel?: string;
  isBalanceLoading?: boolean;
  isBalanceRefreshing?: boolean;
  onRefreshBalance?: () => void;
  children?: ReactNode;
}

export function AccountStrip({
  address,
  addressLabel = "Account",
  addressBadge,
  addressCopyStatus = "idle",
  onCopyAddress,
  network,
  networkLabel = "Network",
  balance,
  balanceLabel = "Balance",
  isBalanceLoading = false,
  isBalanceRefreshing = false,
  onRefreshBalance,
  children,
}: AccountStripProps) {
  const showsBalance = balance !== undefined || isBalanceLoading;

  return (
    <section aria-label="Account" className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-sheet flex-wrap border-border md:min-h-[88px] md:flex-nowrap md:border-x max-md:*:basis-1/2 max-md:[&>*:first-child]:basis-full max-md:[&>*:nth-child(n+2)]:border-t max-md:[&>*:nth-child(2n+3)]:border-l md:[&>*+*]:border-l">
        <AccountStripCell label={addressLabel} isWide>
          <span className="truncate font-mono text-code">{address}</span>
          {addressBadge && <Badge variant="outline">{addressBadge}</Badge>}
          {onCopyAddress && (
            <CopyButton
              variant="ghost"
              size="icon"
              className="ml-auto"
              label="Copy address"
              copiedMessage="Address copied"
              status={addressCopyStatus}
              onCopy={onCopyAddress}
            />
          )}
        </AccountStripCell>

        {children}

        <AccountStripCell label={networkLabel}>
          <span className="truncate text-label">{network}</span>
        </AccountStripCell>

        {showsBalance && (
          <AccountStripCell label={balanceLabel} isBusy={isBalanceLoading}>
            {isBalanceLoading ? (
              <span aria-hidden="true" className="h-3 w-full max-w-24 bg-surface-muted" />
            ) : (
              <span data-testid="account-balance-display" className="truncate font-mono text-data tabular-nums">
                {balance}
              </span>
            )}
            {onRefreshBalance && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={onRefreshBalance}
                disabled={isBalanceLoading}
                isLoading={isBalanceRefreshing}
                data-testid="account-refresh-balance"
                icon={<Icon name="refresh" className="size-icon-md" />}>
                Refresh balance
              </Button>
            )}
          </AccountStripCell>
        )}
      </div>
    </section>
  );
}
