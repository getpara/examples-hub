import type { Address, Hash } from "viem";

export type RecoveryAction = "create" | "protect" | "fund" | "use" | "prove" | "start" | "veto" | "finalize";

export interface RecoveryDemoState {
  safeAddress: Address | null;
  ownerAddress: Address | null;
  newOwnerAddress: Address | null;
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
  activeAction: RecoveryAction | null;
  status: string | null;
  error: Error | null;
}

export const initialState: RecoveryDemoState = {
  safeAddress: null,
  ownerAddress: null,
  newOwnerAddress: null,
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
  activeAction: null,
  status: null,
  error: null,
};
