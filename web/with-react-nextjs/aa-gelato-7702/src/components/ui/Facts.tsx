import type { ReactNode } from "react";
import { cx } from "@/lib/classNames";

export type FactTone = "default" | "mono" | "muted" | "data";

export interface FactRow {
  label: string;
  value: ReactNode;
  tone?: FactTone;
  title?: string;
  testId?: string;
}

interface FactsProps {
  rows: FactRow[];
  className?: string;
}

const TONE_CLASSES: Record<FactTone, string> = {
  default: "text-label",
  mono: "font-mono text-code",
  muted: "text-label text-muted",
  data: "font-mono text-data tabular-nums",
};

export function Facts({ rows, className }: FactsProps) {
  return (
    <dl className={cx("grid border-t border-border", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[128px_minmax(0,1fr)] items-baseline gap-4 border-b border-border py-3 sm:grid-cols-[168px_minmax(0,1fr)]">
          <dt className="font-mono text-mono-label text-muted uppercase">{row.label}</dt>
          <dd
            title={row.title}
            data-testid={row.testId}
            className={cx("min-w-0 [overflow-wrap:anywhere]", TONE_CLASSES[row.tone ?? "default"])}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
