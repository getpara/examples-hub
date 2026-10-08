interface CountdownProps {
  label: string;
  value: string;
}

export function Countdown({ label, value }: CountdownProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border border-border bg-surface p-4">
      <span className="font-mono text-mono-label text-muted uppercase">{label}</span>
      <span className="font-mono text-data tabular-nums">{value}</span>
    </div>
  );
}
