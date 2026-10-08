import type { ComponentProps } from "react";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { cx } from "@/lib/classNames";

interface StepPanelProps extends ComponentProps<typeof ActionPanel> {
  eyebrow: string;
}

export function StepPanel({ eyebrow, className, ...panelProps }: StepPanelProps) {
  return (
    <div className="grid content-start gap-6 pt-8">
      <p className="px-gutter font-mono text-mono-label text-accent uppercase md:px-sheet-x">{eyebrow}</p>
      <ActionPanel className={cx("pt-0!", className)} {...panelProps} />
    </div>
  );
}
