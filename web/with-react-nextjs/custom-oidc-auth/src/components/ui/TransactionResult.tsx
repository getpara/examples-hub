import { Facts } from "@/components/ui/Facts";
import { ResultPanel } from "@/components/ui/ResultPanel";
import type { ResultStatus } from "@/lib/resultStatus";
import type { CopyStatus } from "@/lib/useCopyToClipboard";

interface TransactionResultProps {
  status: ResultStatus;
  hash: string | null;
  hashTestId?: string;
  pendingMessage: string;
  explorerHref?: string;
  explorerLabel?: string;
  errorTitle: string;
  errorMessage?: string;
  copyStatus: CopyStatus;
  onCopy: () => void;
}

const HASH_LABEL = "Transaction hash";

export function TransactionResult({
  status,
  hash,
  hashTestId,
  pendingMessage,
  explorerHref,
  explorerLabel,
  errorTitle,
  errorMessage,
  copyStatus,
  onCopy,
}: TransactionResultProps) {
  return (
    <ResultPanel
      status={status}
      emptyMessage="The transaction hash appears here after you send."
      pendingMessage={pendingMessage}
      successLabel="Confirmed"
      fields={hash ? [{ label: HASH_LABEL, value: hash, testId: hashTestId }] : []}
      onCopy={onCopy}
      copiedMessage="Transaction hash copied"
      copyStatus={copyStatus}
      explorerHref={explorerHref}
      explorerLabel={explorerLabel}
      errorTitle={errorTitle}
      errorMessage={errorMessage}>
      {status === "error" && hash && (
        <Facts rows={[{ label: HASH_LABEL, value: hash, tone: "mono", testId: hashTestId }]} />
      )}
    </ResultPanel>
  );
}
