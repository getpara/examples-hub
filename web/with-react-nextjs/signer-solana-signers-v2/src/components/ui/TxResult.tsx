interface TxResultProps {
  signature: string;
  explorerUrl?: string;
  label?: string;
}

const DEFAULT_EXPLORER = "https://solscan.io/tx";

export function TxResult({ signature, explorerUrl, label = "Transaction Signature" }: TxResultProps) {
  const explorer = explorerUrl || DEFAULT_EXPLORER;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in">
      <div className="border-b border-border/60 px-6 py-4">
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Signature
          </p>
          <p className="break-all rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {signature}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Explorer Link
          </p>
          <a
            href={`${explorer}/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            View on Solscan
          </a>
        </div>
      </div>
    </div>
  );
}
