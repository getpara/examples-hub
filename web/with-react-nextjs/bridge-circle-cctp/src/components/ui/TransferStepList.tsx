import { Icon } from "@/components/ui/Icon";
import { LoadingMark } from "@/components/ui/LoadingMark";
import { cx } from "@/lib/classNames";

export type TransferStepTone = "waiting" | "active" | "done" | "failed";

export interface TransferStepView {
  key: string;
  title: string;
  detail: string;
  statusLabel: string;
  tone: TransferStepTone;
  explorerHref?: string;
  explorerLabel?: string;
}

interface TransferStepListProps {
  steps: TransferStepView[];
  label?: string;
}

const MARKER_CLASSES: Record<TransferStepTone, string> = {
  waiting: "border-border-strong text-muted",
  active: "border-foreground bg-surface text-foreground",
  done: "border-foreground text-foreground",
  failed: "border-destructive text-destructive",
};

function renderStepMarker(tone: TransferStepTone, index: number) {
  if (tone === "active") {
    return <LoadingMark />;
  }

  if (tone === "done") {
    return <Icon name="check" className="size-icon-sm" />;
  }

  if (tone === "failed") {
    return <Icon name="warning" className="size-icon-sm" />;
  }

  return String(index + 1).padStart(2, "0");
}

export function TransferStepList({ steps, label = "Transfer steps" }: TransferStepListProps) {
  return (
    <ol aria-label={label} className="grid border-t border-border">
      {steps.map((step, index) => (
        <li
          key={step.key}
          data-testid={`bridge-step-${step.key}`}
          data-state={step.tone}
          aria-current={step.tone === "active" ? "step" : undefined}
          className={cx(
            "flex min-w-0 items-center gap-3 border-b border-l-2 border-b-border py-3 pr-1 pl-3",
            step.tone === "active" ? "border-l-accent bg-surface" : "border-l-transparent"
          )}>
          <span
            aria-hidden="true"
            className={cx(
              "grid size-7 flex-none place-items-center border font-mono text-mono-label",
              MARKER_CLASSES[step.tone]
            )}>
            {renderStepMarker(step.tone, index)}
          </span>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate text-label">{step.title}</span>
            <span className="truncate text-caption text-muted">{step.detail}</span>
          </span>
          <span className="grid flex-none justify-items-end gap-1">
            <span
              className={cx(
                "font-mono text-mono-label uppercase",
                step.tone === "failed" ? "text-destructive" : step.tone === "waiting" ? "text-muted" : "text-foreground"
              )}>
              {step.statusLabel}
            </span>
            {step.explorerHref && (
              <a
                href={step.explorerHref}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-1 text-caption text-foreground underline decoration-border-strong underline-offset-4">
                {step.explorerLabel ?? "View transaction"}
                <span className="sr-only">for {step.title}</span>
                <Icon name="arrow-up-right" className="size-icon-sm" />
              </a>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
