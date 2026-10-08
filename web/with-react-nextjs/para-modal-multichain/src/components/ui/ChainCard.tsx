import { useId, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ChainCardStatus } from "@/lib/chainCardStatus";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

interface ChainCardProps {
  status: ChainCardStatus;
  mark: ReactNode;
  chain: string;
  network: string;
  address?: string;
  message: string;
  signature?: string;
  signLabel: string;
  onSign: () => void;
  signedLabel?: string;
  copyLabel?: string;
  copiedMessage?: string;
  copyStatus?: CopyStatus;
  onCopySignature?: () => void;
  errorTitle?: string;
  errorMessage?: string;
  testId?: string;
  signTestId?: string;
  signatureTestId?: string;
}

const FACT_ROW_CLASS = "grid grid-cols-[96px_minmax(0,1fr)] items-center border-b border-border py-3";
const MONO_LABEL_CLASS = "font-mono text-mono-label text-muted uppercase";

export function ChainCard({
  status,
  mark,
  chain,
  network,
  address,
  message,
  signature,
  signLabel,
  onSign,
  signedLabel = "Signed",
  copyLabel = "Copy",
  copiedMessage = "Signature copied",
  copyStatus = "idle",
  onCopySignature,
  errorTitle = "Signing failed",
  errorMessage,
  testId,
  signTestId,
  signatureTestId,
}: ChainCardProps) {
  const titleId = useId();
  const isSigned = status === "signed" && Boolean(signature);

  return (
    <section
      aria-labelledby={titleId}
      data-testid={testId}
      className="grid content-start gap-5 px-gutter py-6 md:px-sheet-x">
      <header className="flex items-center gap-3">
        <span className="grid size-10 flex-none place-items-center border border-border bg-surface text-foreground">
          {mark}
        </span>
        <div className="mr-auto grid min-w-0 gap-0.5">
          <h3 id={titleId} className="text-heading tracking-snug">
            {chain}
          </h3>
          <span className={MONO_LABEL_CLASS}>{network}</span>
        </div>
        <span role="status" className="flex items-center">
          {isSigned && <Badge variant="outline">{signedLabel}</Badge>}
        </span>
      </header>

      <dl className="grid border-t border-border">
        {address && (
          <div className={FACT_ROW_CLASS}>
            <dt className={MONO_LABEL_CLASS}>Address</dt>
            <dd className="truncate font-mono text-code">{address}</dd>
          </div>
        )}
        <div className={FACT_ROW_CLASS}>
          <dt className={MONO_LABEL_CLASS}>Message</dt>
          <dd className="truncate font-mono text-code">{message}</dd>
        </div>
      </dl>

      {isSigned && (
        <div className="grid gap-2">
          <span className={MONO_LABEL_CLASS}>Signature</span>
          <code
            data-testid={signatureTestId}
            className="border border-border bg-surface p-3 font-mono text-code [overflow-wrap:anywhere]">
            {signature}
          </code>
        </div>
      )}

      {status === "failed" && (
        <Alert variant="destructive" title={errorTitle}>
          {errorMessage}
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button isLoading={status === "signing"} onClick={onSign} data-testid={signTestId}>
          {signLabel}
        </Button>
        {isSigned && onCopySignature && (
          <CopyButton
            label={copyLabel}
            copiedMessage={copiedMessage}
            status={copyStatus}
            onCopy={onCopySignature}
            size="md"
          />
        )}
      </div>
    </section>
  );
}
