interface TxResultProps {
  hash: string;
  explorerUrl?: string;
}

const DEFAULT_EXPLORER = "https://www.mintscan.io/cosmos/tx";

export function TxResult({ hash, explorerUrl }: TxResultProps) {
  const explorer = explorerUrl || DEFAULT_EXPLORER;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in">
      <div className="border-b border-border/60 px-6 py-4">
        <h3 className="text-sm font-semibold">Transaction Details</h3>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Transaction Hash
          </p>
          <p className="break-all rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {hash}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Explorer Link
          </p>
          <a
            href={`${explorer}/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
