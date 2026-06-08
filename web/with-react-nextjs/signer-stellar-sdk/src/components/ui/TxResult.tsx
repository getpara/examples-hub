import { TESTNET_EXPLORER_URL } from "@/config/constants";

interface TxResultProps {
  signature: string;
  label?: string;
  showExplorerLink?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function TxResult({
  signature,
  label = "Transaction Hash",
  showExplorerLink = true,
  actionLabel,
  onAction,
}: TxResultProps) {
  const explorerUrl = `${TESTNET_EXPLORER_URL}/${signature}`;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in">
      <div className="border-b border-border/60 px-6 py-4">
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Value
          </p>
          <p className="break-all rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {signature}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="btn-secondary px-3 py-1.5 text-sm">
              {actionLabel}
            </button>
          )}

          {showExplorerLink && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-3 py-1.5 text-sm">
              View on Stellar Expert
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
