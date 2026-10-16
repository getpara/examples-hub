"use client";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TransferStepList } from "@/components/ui/TransferStepList";
import type { BridgeTransfer, TransferPhase } from "@/hooks/useBridgeTransfer";
import { useTransferStatus } from "@/hooks/useTransferStatus";
import { findStep } from "@/lib/bridgeSteps";
import { formatErrorMessage } from "@/lib/format";
import type { ResultStatus } from "@/lib/resultStatus";
import { createTransferRecord, serializeTransferRecord } from "@/lib/transferRecord";
import { getRecordRows, getStepViews } from "@/lib/transferDisplay";
import { parseBurnTxHash } from "@/lib/transferStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface TransferProgressContainerProps {
  transfer: BridgeTransfer;
}

const RESULT_STATUS_BY_PHASE: Record<TransferPhase, ResultStatus> = {
  idle: "empty",
  running: "pending",
  success: "success",
  failed: "error",
};

export function TransferProgressContainer({ transfer }: TransferProgressContainerProps) {
  const recordCopy = useCopyToClipboard();
  const burnTxHash = parseBurnTxHash(findStep(transfer.steps, "burn")?.txHash ?? "");
  const status = useTransferStatus(transfer.phase === "success" ? burnTxHash : null, { pollUntilMinted: true });
  const record = transfer.phase === "success" && transfer.result ? createTransferRecord(transfer.result, transfer.steps, status.lookup) : null;
  const mintSigner = transfer.request?.mintSigner ?? "wallet";

  return (
    <ResultPanel
      status={RESULT_STATUS_BY_PHASE[transfer.phase]}
      title="Transfer"
      emptyMessage="Bridge progress appears here."
      pendingLabel="In progress"
      pendingMessage="Approve and burn are signed on Base, then Circle attests the burn before the mint on Arc."
      successLabel="Complete"
      errorTitle="Transfer did not finish"
      errorMessage={formatErrorMessage(transfer.errorMessage)}
      errorTestId="transfer-error">
      {transfer.phase !== "idle" && <TransferStepList steps={getStepViews(transfer.steps, mintSigner)} />}

      {transfer.phase === "failed" && (
        <div>
          <Button
            variant="outline"
            onClick={() => void transfer.retry()}
            icon={<Icon name="refresh" className="size-icon-md" />}
            data-testid="transfer-retry-button">
            Retry transfer
          </Button>
        </div>
      )}

      {record && (
        <div className="grid gap-4" data-testid="transfer-record">
          <Facts rows={getRecordRows(record, status.isLoading)} />
          {status.errorMessage && <p className="text-caption text-muted">Circle status check failed. {formatErrorMessage(status.errorMessage)}</p>}
          <div>
            <CopyButton
              label="Copy record"
              copiedMessage="Transfer record copied"
              status={recordCopy.status}
              onCopy={() => recordCopy.copy(serializeTransferRecord(record))}
            />
          </div>
        </div>
      )}
    </ResultPanel>
  );
}
