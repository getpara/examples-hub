import type { RecoveryAction } from "@/lib/safeRecoveryState";
import type { StepDefinition } from "@/lib/useStepProgress";
import { SEPOLIA } from "@/lib/chain";
import { SAFE_VERSION } from "@/lib/safeRecovery";

export interface RecoveryProgress {
  safeAddress: string | null;
  newOwnerAddress: string | null;
  createTxHash: string | null;
  protectUserOpHash: string | null;
  faucetTxHash: string | null;
  normalTxHash: string | null;
  negativeProof: string | null;
  recoveryTxHash: string | null;
  cancelTxHash: string | null;
  finalizeTxHash: string | null;
  activeAction: RecoveryAction | null;
}

interface RecoveryActionContext {
  hasGuardian: boolean;
  isFaucetPending: boolean;
  remainingSeconds: number;
}

export const RECOVERY_STEPS = [
  {
    title: "Create the Safe",
    api: "toSafeSmartAccount()",
    description: `Creates a Safe ${SAFE_VERSION} ERC-4337 account on ${SEPOLIA.name}. A local key stands in for the app passkey as the owner.`,
  },
  {
    title: "Add Para as guardian",
    api: "enableModule · addGuardianWithThreshold",
    description:
      "The Safe enables the recovery module and registers this Para wallet as its only guardian. Para is not an owner.",
  },
  {
    title: "Fund the guardian",
    api: 'requestFaucetAsync({ chain: "ETHEREUM_SEPOLIA" })',
    description:
      "Requests Sepolia ETH for this Para wallet from the Para faucet. The guardian sends the recovery transactions itself, so it needs gas.",
  },
  {
    title: "Use the Safe",
    api: "sendTransaction({ calls })",
    description: "Sends a sponsored user operation signed by the local owner key, not by Para.",
  },
  {
    title: "Prove Para cannot spend",
    api: "signMessage · call(execTransaction)",
    description:
      "Para signs a Safe transaction and the app simulates it. The Safe must reject it because Para is a guardian, not an owner.",
  },
  {
    title: "Recover the owner",
    api: "confirmRecovery · finalizeRecovery",
    description:
      "Para starts recovery to a new owner. The current owner can veto it. After the grace period, Para finalizes it.",
  },
] as const;

export function getRecoveryStepDefinitions(progress: RecoveryProgress): StepDefinition[] {
  const completions = [
    progress.createTxHash,
    progress.protectUserOpHash,
    progress.faucetTxHash,
    progress.normalTxHash,
    progress.negativeProof,
    progress.finalizeTxHash,
  ];

  return RECOVERY_STEPS.map((step, index) => ({ title: step.title, isComplete: Boolean(completions[index]) }));
}

export function getRecoveryActionAvailability(progress: RecoveryProgress, context: RecoveryActionContext) {
  const isIdle = progress.activeAction === null;
  const isRecoveryOpen = Boolean(progress.recoveryTxHash) && !progress.cancelTxHash && !progress.finalizeTxHash;

  return {
    canCreateSafe: isIdle && !progress.createTxHash,
    canProtectSafe:
      isIdle && context.hasGuardian && Boolean(progress.safeAddress && progress.createTxHash) && !progress.protectUserOpHash,
    canRequestFunds: isIdle && context.hasGuardian && !context.isFaucetPending,
    canSendOwnerTransaction: isIdle && Boolean(progress.protectUserOpHash),
    canProveGuardianCannotSpend: isIdle && context.hasGuardian && Boolean(progress.protectUserOpHash),
    canStartRecovery:
      isIdle &&
      context.hasGuardian &&
      Boolean(progress.protectUserOpHash && progress.newOwnerAddress && progress.faucetTxHash) &&
      !progress.recoveryTxHash,
    canRestart: isIdle && Boolean(progress.cancelTxHash),
    canVetoRecovery: isIdle && isRecoveryOpen,
    canFinalizeRecovery: isIdle && context.hasGuardian && isRecoveryOpen && context.remainingSeconds === 0,
  };
}

export function getGracePeriodLabel(progress: RecoveryProgress, remainingSeconds: number) {
  if (progress.cancelTxHash) return "Vetoed";
  if (progress.finalizeTxHash || remainingSeconds === 0) return "Ended";
  return `${remainingSeconds}s remaining`;
}
