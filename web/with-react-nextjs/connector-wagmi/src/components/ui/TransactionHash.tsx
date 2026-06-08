interface TransactionHashProps {
  txHash: string;
}

export function TransactionHash({ txHash }: TransactionHashProps) {
  if (!txHash) return null;

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-card-foreground">Transaction hash</h2>
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="tx-etherscan-link"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
          View on Etherscan
        </a>
      </div>
      <div className="p-6">
        <p className="break-all rounded-xl border border-border bg-muted/60 px-4 py-3 font-mono text-xs leading-5 text-card-foreground" data-testid="tx-hash-display">
          {txHash}
        </p>
      </div>
    </div>
  );
}
