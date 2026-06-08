import { formatAddress } from "@/utils/format";

interface WalletDisplayProps {
  address?: string;
  balance: string;
  networkName: string;
  onDisconnect: () => void;
  onOpenAccount: () => void;
}

export function WalletDisplay({
  address,
  balance,
  networkName,
  onDisconnect,
  onOpenAccount,
}: WalletDisplayProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold text-card-foreground">Connected wallet</h2>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</p>
          <p className="mt-2 break-all font-mono text-sm font-medium text-card-foreground" data-testid="account-address-display">
            {address ? formatAddress(address) : "Unknown address"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Network</p>
          <p className="mt-2 text-sm font-medium text-card-foreground">{networkName}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Balance</p>
          <p className="mt-2 text-sm font-medium text-card-foreground">{balance}</p>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button type="button" onClick={onOpenAccount} className="btn-primary px-4 py-3">
            Open Account
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
