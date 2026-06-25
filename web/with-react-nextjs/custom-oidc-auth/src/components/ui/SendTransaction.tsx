import { TxResult } from "@/components/ui/TxResult";

interface SendTransactionProps {
  amount: string;
  onSend: () => void;
  isLoading: boolean;
  isReady: boolean;
  txHash: string | null;
  error: string | null;
}

const STATUS_STYLES = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success-foreground",
} as const;

export function SendTransaction({ amount, onSend, isLoading, isReady, txHash, error }: SendTransactionProps) {
  const statusMessage = isLoading
    ? "Submitting transaction..."
    : error
      ? error
      : txHash
        ? "Transaction confirmed."
        : null;
  const statusClass = isLoading ? STATUS_STYLES.pending : error ? STATUS_STYLES.error : STATUS_STYLES.success;

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className={`rounded-lg border p-4 ${statusClass}`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">Send transaction</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Self-transfer {amount} ETH on Sepolia, signed by your Para wallet through ethers
          </p>
        </div>
        <div className="px-6 py-5">
          <button
            type="button"
            onClick={onSend}
            disabled={isLoading || !isReady}
            data-testid="custom-oidc-send-tx"
            className="btn-primary min-h-11 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? "Sending..." : `Send ${amount} ETH to yourself`}
          </button>
        </div>
      </div>

      {txHash && <TxResult hash={txHash} label="Transaction" testId="custom-oidc-send-tx-hash" />}
    </div>
  );
}
