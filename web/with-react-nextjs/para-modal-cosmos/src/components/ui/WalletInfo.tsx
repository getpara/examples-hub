interface WalletInfoProps {
  address: string;
}

export function WalletInfo({ address }: WalletInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-success" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Connected
        </p>
      </div>
      <p className="text-[13px] font-mono break-all leading-relaxed">{address}</p>
    </div>
  );
}
