import { useId, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { LoadingMark } from "@/components/ui/LoadingMark";
import type { ResultStatus } from "@/lib/resultStatus";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

export interface ResultField {
  label: string;
  value: string;
  testId?: string;
}

interface ResultPanelProps {
  status: ResultStatus;
  title?: string;
  emptyMessage?: string;
  pendingLabel?: string;
  pendingMessage?: string;
  successLabel?: string;
  fields?: ResultField[];
  copyLabel?: string;
  copiedMessage?: string;
  copyStatus?: CopyStatus;
  onCopy?: () => void;
  explorerHref?: string;
  explorerLabel?: string;
  explorerTestId?: string;
  errorTitle?: string;
  errorMessage?: string;
  errorTestId?: string;
  children?: ReactNode;
}

export function ResultPanel({
  status,
  title = "Result",
  emptyMessage = "The result appears here.",
  pendingLabel = "Pending",
  pendingMessage,
  successLabel,
  fields = [],
  copyLabel = "Copy",
  copiedMessage = "Copied to the clipboard",
  copyStatus = "idle",
  onCopy,
  explorerHref,
  explorerLabel = "View on explorer",
  explorerTestId,
  errorTitle = "Something went wrong",
  errorMessage,
  errorTestId,
  children,
}: ResultPanelProps) {
  const titleId = useId();
  const showsFields = fields.length > 0 && (status === "success" || status === "pending");
  const showsActions = status === "success" && (onCopy || explorerHref);

  return (
    <section
      aria-labelledby={titleId}
      className="grid content-start gap-5 px-gutter py-8 md:px-sheet-x">
      <header className="flex min-h-7 items-center gap-3">
        <h2 id={titleId} className="mr-auto font-mono text-mono-label text-muted uppercase">
          {title}
        </h2>
        <div role="status" className="flex items-center">
          {status === "pending" && (
            <span className="inline-flex items-center gap-2 text-label">
              <LoadingMark />
              {pendingLabel}
              {pendingMessage && <span className="sr-only">{pendingMessage}</span>}
            </span>
          )}
          {status === "success" && successLabel && <Badge variant="outline">{successLabel}</Badge>}
        </div>
      </header>

      {status === "empty" && (
        <div className="grid min-h-60 place-content-center justify-items-center gap-4 border border-dashed border-border-strong p-6 text-center text-caption text-muted">
          <span aria-hidden="true" className="pixel-grid size-10" />
          <p className="max-w-[28ch]">{emptyMessage}</p>
        </div>
      )}

      {status === "pending" && pendingMessage && (
        <p aria-hidden="true" className="text-caption text-muted">
          {pendingMessage}
        </p>
      )}

      {showsFields && (
        <dl className="grid gap-4">
          {fields.map((field) => (
            <div key={field.label} className="grid gap-2">
              <dt className="font-mono text-mono-label text-muted uppercase">{field.label}</dt>
              <dd
                data-testid={field.testId}
                className="border border-border bg-surface p-4 font-mono text-code [overflow-wrap:anywhere]">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {showsActions && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {onCopy && <CopyButton label={copyLabel} copiedMessage={copiedMessage} status={copyStatus} onCopy={onCopy} />}
          {explorerHref && (
            <a
              href={explorerHref}
              data-testid={explorerTestId}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center gap-1 text-label text-foreground underline decoration-border-strong underline-offset-4">
              {explorerLabel}
              <Icon name="arrow-up-right" className="size-icon-sm" />
            </a>
          )}
        </div>
      )}

      {status === "error" && (
        <Alert variant="destructive" title={errorTitle} testId={errorTestId}>
          {errorMessage}
        </Alert>
      )}

      {children}
    </section>
  );
}
