import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/classNames";

export interface StepListItem {
  title: string;
  status: string;
  isDone?: boolean;
  isCurrent?: boolean;
}

export type StepListVariant = "row" | "rail";

interface StepListProps {
  steps: StepListItem[];
  variant?: StepListVariant;
  heading?: string;
  label?: string;
}

export function StepList({ steps, variant = "row", heading, label = "Progress" }: StepListProps) {
  const isRail = variant === "rail";

  return (
    <nav aria-label={heading ?? label} className={cx("grid content-start gap-4", isRail && "py-8")}>
      {heading && (
        <p className={cx("font-mono text-mono-label text-muted uppercase", isRail && "px-gutter md:px-sheet-x")}>{heading}</p>
      )}
      <ol
        className={cx(
          "grid border-border",
          isRail ? "border-y" : "auto-cols-fr grid-flow-col border"
        )}>
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={step.isCurrent ? "step" : undefined}
            className={cx(
              "flex min-w-0 items-center gap-3 py-3",
              isRail
                ? "border-l-2 px-gutter md:px-sheet-x"
                : "border-t-2 px-4",
              index > 0 && (isRail ? "border-t border-t-border" : "border-l border-l-border"),
              isRail
                ? step.isCurrent ? "border-l-accent" : "border-l-transparent"
                : step.isCurrent ? "border-t-accent" : "border-t-transparent",
              step.isCurrent ? "bg-surface text-foreground" : step.isDone ? "text-foreground" : "text-muted"
            )}>
            <span
              aria-hidden="true"
              className={cx(
                "grid size-7 flex-none place-items-center border font-mono text-mono-label",
                step.isCurrent
                  ? "border-foreground bg-foreground text-background"
                  : step.isDone
                    ? "border-foreground"
                    : "border-border-strong"
              )}>
              {step.isDone ? <Icon name="check" className="size-icon-sm" /> : String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate text-label">{step.title}</span>
              <span className="font-mono text-mono-label uppercase">{step.status}</span>
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
