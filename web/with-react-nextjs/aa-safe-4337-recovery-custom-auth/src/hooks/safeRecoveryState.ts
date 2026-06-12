import type { Address, Hash } from "viem";

export interface RecoveryDemoState {
  safeAddress: Address | null;
  ownerAddress: Address | null;
  newOwnerAddress: Address | null;
  guardianAddress: Address | null;
  createTxHash: Hash | null;
  protectUserOpHash: Hash | null;
  normalTxHash: Hash | null;
  recoveryTxHash: Hash | null;
  cancelTxHash: Hash | null;
  finalizeTxHash: Hash | null;
  postRecoveryTxHash: Hash | null;
  faucetTxHash: string | null;
  negativeProof: string | null;
  negativeProofStatus: "success" | "error" | null;
  moduleProof: string | null;
  recoveryExecuteAfter: number | null;
  status: string | null;
  error: Error | null;
  isWorking: boolean;
}

export const initialState: RecoveryDemoState = {
  safeAddress: null,
  ownerAddress: null,
  newOwnerAddress: null,
  guardianAddress: null,
  createTxHash: null,
  protectUserOpHash: null,
  normalTxHash: null,
  recoveryTxHash: null,
  cancelTxHash: null,
  finalizeTxHash: null,
  postRecoveryTxHash: null,
  faucetTxHash: null,
  negativeProof: null,
  negativeProofStatus: null,
  moduleProof: null,
  recoveryExecuteAfter: null,
  status: null,
  error: null,
  isWorking: false,
};

export function toError(error: unknown, fallback: string) {
  if (error instanceof Error) return error;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return new Error(message);
  }
  return new Error(fallback);
}
