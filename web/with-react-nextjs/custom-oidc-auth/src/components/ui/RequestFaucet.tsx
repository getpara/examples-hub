import { TxResult } from "@/components/ui/TxResult";

interface RequestFaucetProps {
  onRequest: () => void;
  isPending: boolean;
  txHash: string | null;
  error: string | null;
}

const STATUS_STYLES = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success-foreground",
} as const;

export function RequestFaucet({ onRequest, isPending, txHash, error }: RequestFaucetProps) {
  const statusMessage = isPending
    ? "Requesting testnet ETH..."
    : error
      ? error
      : txHash
        ? "Faucet funds requested — wait for the transaction to confirm before sending."
        : null;
  const statusClass = isPending ? STATUS_STYLES.pending : error ? STATUS_STYLES.error : STATUS_STYLES.success;

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className={`rounded-lg border p-4 ${statusClass}`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">Request faucet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fund your Para wallet with Sepolia testnet ETH</p>
        </div>
        <div className="px-6 py-5">
          <button
            type="button"
            onClick={onRequest}
            disabled={isPending}
            data-testid="custom-oidc-faucet"
            className="btn-primary min-h-11 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {isPending ? "Requesting..." : "Request testnet ETH"}
          </button>
        </div>
      </div>

      {txHash && <TxResult hash={txHash} label="Faucet transaction" testId="custom-oidc-faucet-tx" />}
    </div>
  );
}
