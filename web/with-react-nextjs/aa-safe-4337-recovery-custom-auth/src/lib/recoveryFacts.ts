import type { FactRow } from "@/components/ui/Facts";
import { SEPOLIA } from "@/lib/chain";
import { shortenAddress } from "@/lib/format";
import { BURN_ADDRESS, GUARDIAN_THRESHOLD, SOCIAL_RECOVERY_MODULE_ADDRESS } from "@/lib/safeRecovery";

interface RecoveryFactsInput {
  safeAddress: string | null;
  ownerAddress: string | null;
  newOwnerAddress: string | null;
  createTxHash: string | null;
  protectUserOpHash: string | null;
  faucetTxHash: string | null;
  normalTxHash: string | null;
  recoveryTxHash: string | null;
  cancelTxHash: string | null;
  finalizeTxHash: string | null;
  postRecoveryTxHash: string | null;
}

function shortFact(label: string, value: string | null): FactRow[] {
  return value ? [{ label, value: shortenAddress(value), title: value, tone: "mono" }] : [];
}

export function getSafeFacts(input: RecoveryFactsInput, guardianAddress: string): FactRow[] {
  const isRecoveryPending = Boolean(input.recoveryTxHash) && !input.cancelTxHash && !input.finalizeTxHash;
  const recoveryOutcome = input.finalizeTxHash ? "Complete" : input.cancelTxHash ? "Vetoed" : null;

  return [
    ...(input.safeAddress
      ? shortFact("Safe account", input.safeAddress)
      : [{ label: "Safe account", value: "Not created", tone: "muted" } satisfies FactRow]),
    ...(input.ownerAddress
      ? shortFact("Owner", input.ownerAddress)
      : [{ label: "Owner", value: "Create the Safe to generate the owner.", tone: "muted" } satisfies FactRow]),
    ...(isRecoveryPending ? shortFact("Pending owner", input.newOwnerAddress) : []),
    ...shortFact("Guardian", guardianAddress || null),
    ...(input.protectUserOpHash && !input.normalTxHash
      ? [{ label: "Threshold", value: GUARDIAN_THRESHOLD.toString(), tone: "data" } satisfies FactRow]
      : []),
    ...(input.recoveryTxHash ? [] : shortFact("Owner transaction", input.normalTxHash)),
    ...(recoveryOutcome ? [{ label: "Recovery", value: recoveryOutcome } satisfies FactRow] : []),
  ];
}

export function getStepFacts(stepIndex: number, input: RecoveryFactsInput): FactRow[] {
  switch (stepIndex) {
    case 0:
      return [
        { label: "Network", value: SEPOLIA.name },
        { label: "Owner", value: "Local key for this demo" },
        { label: "Gas", value: "Sponsored" },
        ...shortFact("Deployment transaction", input.createTxHash),
      ];
    case 1:
      return [
        ...shortFact("Recovery module", SOCIAL_RECOVERY_MODULE_ADDRESS),
        ...shortFact("Setup transaction", input.protectUserOpHash),
      ];
    case 2:
      return shortFact("Faucet transaction", input.faucetTxHash);
    case 3:
      return [...shortFact("Target", BURN_ADDRESS), ...shortFact("Owner transaction", input.normalTxHash)];
    case 4:
      return [];
    default:
      if (input.finalizeTxHash) {
        return [
          ...shortFact("Finalize transaction", input.finalizeTxHash),
          ...shortFact("New owner transaction", input.postRecoveryTxHash),
        ];
      }
      return [
        ...shortFact("New owner", input.newOwnerAddress),
        ...shortFact("Recovery transaction", input.recoveryTxHash),
        ...shortFact("Veto transaction", input.cancelTxHash),
      ];
  }
}
