interface TransactionHashProps {
  transactionHash: string | null;
}

export function TransactionHash({ transactionHash }: TransactionHashProps) {
  if (!transactionHash) {
    return null;
  }

  const explorerUrl = `https://testnet.ping.pub/cosmos/tx/${transactionHash}`;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Transaction Hash</h2>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="tx-explorer-link"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View -&gt;
        </a>
      </div>
      <div className="p-6">
        <div className="rounded-xl bg-muted/60 px-4 py-3 break-all" data-testid="tx-hash-display">
          <code className="text-xs font-mono text-muted-foreground leading-relaxed">
            {transactionHash}
          </code>
        </div>
      </div>
    </div>
  );
}
