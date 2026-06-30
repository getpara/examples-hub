import { TxResult } from "@/components/ui/TxResult";
import type { SendTransactionStatus } from "@/hooks/useSendTransaction";

interface SendTransactionProps {
  amount: string;
  onSend: () => void;
  isLoading: boolean;
  disabledReason: string | null;
  txHash: string | null;
  status: SendTransactionStatus;
  recipientAddress: string | null;
  error: string | null;
}

const STATUS_STYLES = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success-foreground",
} as const;

function getStatusMessage(status: SendTransactionStatus, error: string | null, txHash: string | null) {
  if (error) return error;
  if (status === "signing") return "Review in Para.";
  if (status === "submitted" && txHash) return "Transaction submitted. Waiting for Sepolia confirmation...";
  if (status === "confirmed" && txHash) return "Sent successfully.";
  return null;
}

function getButtonLabel(status: SendTransactionStatus, amount: string) {
  if (status === "signing") return "Signing...";
  if (status === "submitted") return "Waiting for confirmation...";
  return `Send ${amount} ETH back to faucet`;
}

export function SendTransaction({
  amount,
  onSend,
  isLoading,
  disabledReason,
  txHash,
  status,
  recipientAddress,
  error,
}: SendTransactionProps) {
  const statusMessage = getStatusMessage(status, error, txHash);
  const statusClass = error ? STATUS_STYLES.error : status === "confirmed" ? STATUS_STYLES.success : STATUS_STYLES.pending;
  const isDisabled = isLoading || Boolean(disabledReason);

  return (
    <section className="border-t border-border/60 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">Send ETH</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sends over the limit may require approval.</p>
          {recipientAddress && <p className="mt-1 text-sm text-muted-foreground">Funds return to the demo faucet.</p>}
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={isDisabled}
          data-testid="custom-oidc-send-tx"
          className="btn-primary min-h-11 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-56">
          {getButtonLabel(status, amount)}
        </button>
      </div>
      {disabledReason && <p className="mt-3 text-sm text-muted-foreground">{disabledReason}</p>}

      {statusMessage && (
        <div className={`mt-4 rounded-md border px-3 py-2 ${statusClass}`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}

      {txHash && <TxResult hash={txHash} label="Send transaction hash" testId="custom-oidc-send-tx-hash" compact />}
    </section>
  );
}
