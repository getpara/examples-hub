import type { Hash } from "viem";

interface SendTransactionProps {
  chainName: string;
  targetAddress: `0x${string}`;
  onSend: () => void;
  isPending: boolean;
  error: Error | null;
  transactionHash: Hash | null;
  isReady: boolean;
}

export function SendTransaction({
  chainName,
  targetAddress,
  onSend,
  isPending,
  error,
  transactionHash,
  isReady,
}: SendTransactionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Send Sponsored Transaction</h2>
      </div>

      <div className="p-6 space-y-4">
        {isPending && (
          <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Sending gas-sponsored EIP-4337 transaction...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive break-words">
              {error.message || "Transaction failed. Please try again."}
            </p>
          </div>
        )}

        {transactionHash && !error && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">Sponsored EIP-4337 transaction sent.</p>
          </div>
        )}

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Network</p>
          <p className="text-sm font-mono font-medium">{chainName}</p>
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Target</p>
          <p className="text-sm font-mono break-all">{targetAddress}</p>
        </div>

        <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
          Sends a zero-value UserOperation using Pimlico gas sponsorship.
        </p>

        <button
          type="button"
          onClick={onSend}
          data-testid="send-sponsored-transaction-button"
          disabled={isPending || !isReady}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending ? "Sending..." : "Send Sponsored Transaction"}
        </button>

        {transactionHash && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="transaction-hash-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {transactionHash}
              </code>
            </div>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View on Etherscan -&gt;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
