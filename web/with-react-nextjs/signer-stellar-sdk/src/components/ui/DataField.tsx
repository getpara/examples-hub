interface DataFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  "data-testid"?: string;
}

export function DataField({ label, value, mono, "data-testid": testId }: DataFieldProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        data-testid={testId}
        className={`break-all rounded-xl bg-muted/60 px-4 py-3 text-sm leading-relaxed ${
          mono ? "font-mono" : ""
        }`}>
        {value}
      </p>
    </div>
  );
}
