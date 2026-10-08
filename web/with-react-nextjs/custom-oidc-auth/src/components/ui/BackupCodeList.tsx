import { useId } from "react";

interface BackupCodeListProps {
  label: string;
  codes: string[];
  testId?: string;
}

export function BackupCodeList({ label, codes, testId }: BackupCodeListProps) {
  const labelId = useId();

  return (
    <div className="grid gap-2">
      <span id={labelId} className="text-caption text-muted">
        {label}
      </span>
      <ul
        aria-labelledby={labelId}
        data-testid={testId}
        className="grid grid-cols-2 border-t border-l border-border sm:grid-cols-4">
        {codes.map((code) => (
          <li key={code} className="border-r border-b border-border p-2 font-mono text-code [overflow-wrap:anywhere]">
            {code}
          </li>
        ))}
      </ul>
    </div>
  );
}
