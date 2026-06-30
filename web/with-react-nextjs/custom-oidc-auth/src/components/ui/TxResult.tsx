import { SEPOLIA_EXPLORER_TX_URL } from "@/lib/para";

interface TxResultProps {
  hash: string;
  label?: string;
  testId?: string;
  compact?: boolean;
}

// Shows a transaction hash plus a link to view it on Sepolia Etherscan. Shared by the
// faucet and send-transaction cards (both produce a Sepolia tx hash).
export function TxResult({ hash, label = "Transaction", testId, compact = false }: TxResultProps) {
  if (compact) {
    return (
      <div className="mt-4 rounded-md border border-border bg-muted/70 px-3 py-2" data-testid={testId}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <code className="mt-2 block break-all font-mono text-xs text-card-foreground">{hash}</code>
        <a
          href={`${SEPOLIA_EXPLORER_TX_URL}/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          View on Etherscan →
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-lg font-semibold text-card-foreground">{label}</h2>
      </div>
      <div className="space-y-3 px-6 py-5">
        <div className="break-all rounded-lg border border-border bg-muted p-4" data-testid={testId}>
          <code className="font-mono text-sm text-card-foreground">{hash}</code>
        </div>
        <a
          href={`${SEPOLIA_EXPLORER_TX_URL}/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          View on Etherscan →
        </a>
      </div>
    </div>
  );
}
