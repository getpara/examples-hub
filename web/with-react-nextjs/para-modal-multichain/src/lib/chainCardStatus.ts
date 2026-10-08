import { getResultStatus, type ResultStatus } from "@/lib/resultStatus";

export type ChainCardStatus = "empty" | "signing" | "signed" | "failed";

const CHAIN_CARD_STATUSES: Record<ResultStatus, ChainCardStatus> = {
  empty: "empty",
  pending: "signing",
  success: "signed",
  error: "failed",
};

interface ChainCardStatusInput {
  isPending: boolean;
  errorMessage: string | null;
  signature: string | undefined;
}

export function getChainCardStatus({ isPending, errorMessage, signature }: ChainCardStatusInput): ChainCardStatus {
  return CHAIN_CARD_STATUSES[getResultStatus({ isPending, errorMessage, value: signature })];
}
