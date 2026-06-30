import { TxResult } from "@/components/ui/TxResult";
import type { FaucetStatus } from "@/hooks/useFaucet";

interface RequestFaucetProps {
  onRequest: () => void;
  isPending: boolean;
  disabledReason: string | null;
  txHash: string | null;
  status: FaucetStatus;
  error: string | null;
}

const STATUS_STYLES = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success-foreground",
} as const;

function getStatusMessage(status: FaucetStatus, error: string | null, txHash: string | null) {
  if (error) return error;
  if (status === "requesting") return "Requesting Sepolia testnet ETH...";
  if (status === "submitted" && txHash) return "Faucet transaction submitted. Waiting for Sepolia confirmation...";
  if (status === "confirmed" && txHash) return "Faucet funds confirmed on Sepolia.";
  return null;
}

export function RequestFaucet({ onRequest, isPending, disabledReason, txHash, status, error }: RequestFaucetProps) {
  const statusMessage = getStatusMessage(status, error, txHash) ?? disabledReason;
  const statusClass = error ? STATUS_STYLES.error : status === "confirmed" ? STATUS_STYLES.success : STATUS_STYLES.pending;
  const isDisabled = isPending || Boolean(disabledReason);

  return (
    <section className="border-t border-border/60 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">Request faucet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fund this wallet with Sepolia ETH.</p>
        </div>
        <button
          type="button"
          onClick={onRequest}
          disabled={isDisabled}
          data-testid="custom-oidc-faucet"
          className="btn-primary min-h-11 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-52">
          {status === "submitted" ? "Waiting for confirmation..." : isPending ? "Requesting..." : "Request testnet ETH"}
        </button>
      </div>

      {statusMessage && (
        <div className={`mt-4 rounded-md border px-3 py-2 ${statusClass}`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}

      {txHash && <TxResult hash={txHash} label="Faucet transaction hash" testId="custom-oidc-faucet-tx" compact />}
    </section>
  );
}
