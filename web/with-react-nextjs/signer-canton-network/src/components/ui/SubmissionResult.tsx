import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { AsideEmpty } from "@/components/ui/AsideEmpty";
import { Badge } from "@/components/ui/Badge";
import { Facts, type FactRow } from "@/components/ui/Facts";
import { LoadingMark } from "@/components/ui/LoadingMark";
import type { ResultStatus } from "@/lib/resultStatus";

interface SubmissionResultProps {
  status: ResultStatus;
  emptyMessage: string;
  pendingMessage?: string;
  successLabel?: string;
  successTitle: string;
  successMessage: string;
  errorTitle: string;
  errorMessage?: string;
  facts: FactRow[];
}

export function SubmissionResult({
  status,
  emptyMessage,
  pendingMessage = "Approve the request in the Para window.",
  successLabel = "Accepted",
  successTitle,
  successMessage,
  errorTitle,
  errorMessage,
  facts,
}: SubmissionResultProps) {
  return (
    <Aside
      title="Result"
      status={
        <div role="status" className="flex items-center">
          {status === "pending" && (
            <span className="inline-flex items-center gap-2 text-label">
              <LoadingMark />
              Pending
              <span className="sr-only">{pendingMessage}</span>
            </span>
          )}
          {status === "success" && <Badge variant="success">{successLabel}</Badge>}
        </div>
      }>
      {status === "empty" && <AsideEmpty>{emptyMessage}</AsideEmpty>}
      {status === "pending" && (
        <p aria-hidden="true" className="text-caption text-muted">
          {pendingMessage}
        </p>
      )}
      {status === "success" && (
        <Alert variant="success" title={successTitle}>
          {successMessage}
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive" title={errorTitle}>
          {errorMessage}
        </Alert>
      )}
      {facts.length > 0 && <Facts rows={facts} />}
    </Aside>
  );
}
