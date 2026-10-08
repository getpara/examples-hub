interface SecretValueProps {
  label: string;
  value: string;
  testId?: string;
}

export function SecretValue({ label, value, testId }: SecretValueProps) {
  return (
    <div className="grid gap-2">
      <span className="text-caption text-muted">{label}</span>
      <code
        data-testid={testId}
        className="border border-border bg-background p-3 font-mono text-code tracking-[0.02em] [overflow-wrap:anywhere]">
        {value}
      </code>
    </div>
  );
}
