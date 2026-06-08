interface DataFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function DataField({ label, value, mono }: DataFieldProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`break-all rounded-xl bg-muted/60 px-4 py-3 text-sm leading-relaxed ${
          mono ? "font-mono" : ""
        }`}>
        {value}
      </p>
    </div>
  );
}
