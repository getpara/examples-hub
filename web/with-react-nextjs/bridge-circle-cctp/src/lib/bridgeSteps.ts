import type { BridgeResult } from "@circle-fin/bridge-kit";
import type { BridgeEvent } from "@/lib/bridgeKit";

export type TransferStepName = "approve" | "burn" | "attestation" | "mint";

export type TransferStepState = "waiting" | "active" | "done" | "skipped" | "failed";

export interface TransferStep {
  name: TransferStepName;
  state: TransferStepState;
  txHash: string | null;
  errorMessage: string | null;
  isForwarded: boolean;
}

type BridgeStepState = BridgeResult["steps"][number]["state"];

const STEP_ORDER: TransferStepName[] = ["approve", "burn", "attestation", "mint"];

const STEP_NAME_BY_METHOD: Record<string, TransferStepName> = {
  approve: "approve",
  burn: "burn",
  fetchAttestation: "attestation",
  reAttest: "attestation",
  mint: "mint",
};

const STEP_STATE_BY_BRIDGE_STATE: Record<BridgeStepState, TransferStepState> = {
  pending: "active",
  success: "done",
  noop: "skipped",
  error: "failed",
};

interface StepUpdate {
  name: TransferStepName;
  state: BridgeStepState;
  txHash?: string;
  errorMessage?: string;
  forwarded?: boolean;
}

export function createWaitingSteps(): TransferStep[] {
  return STEP_ORDER.map((name) => ({ name, state: "waiting", txHash: null, errorMessage: null, isForwarded: false }));
}

export function activateFirstOpenStep(steps: TransferStep[]): TransferStep[] {
  const openIndex = steps.findIndex((step) => step.state !== "done" && step.state !== "skipped");

  return steps.map((step, index) =>
    index === openIndex ? { ...step, state: "active", errorMessage: null } : step
  );
}

function applyStepUpdate(steps: TransferStep[], update: StepUpdate): TransferStep[] {
  const updatedIndex = STEP_ORDER.indexOf(update.name);
  const nextState = STEP_STATE_BY_BRIDGE_STATE[update.state];
  const isFinished = nextState === "done" || nextState === "skipped";

  return steps.map((step, index) => {
    if (index === updatedIndex) {
      return {
        ...step,
        state: nextState,
        txHash: update.txHash ?? step.txHash,
        errorMessage: update.errorMessage ?? null,
        isForwarded: update.forwarded ?? step.isForwarded,
      };
    }

    if (isFinished && index === updatedIndex + 1 && step.state === "waiting") {
      return { ...step, state: "active" };
    }

    return step;
  });
}

export function applyBridgeEvent(steps: TransferStep[], event: BridgeEvent): TransferStep[] {
  const name = STEP_NAME_BY_METHOD[event.method];

  if (!name || !("state" in event.values)) {
    return steps;
  }

  const { state, txHash, errorMessage, forwarded } = event.values;

  return applyStepUpdate(steps, { name, state, txHash, errorMessage, forwarded });
}

export function applyBridgeResult(steps: TransferStep[], result: BridgeResult): TransferStep[] {
  return result.steps.reduce((current, step) => {
    const name = STEP_NAME_BY_METHOD[step.name];

    if (!name) {
      return current;
    }

    return applyStepUpdate(current, {
      name,
      state: step.state,
      txHash: step.txHash,
      errorMessage: step.errorMessage,
      forwarded: step.forwarded,
    });
  }, steps);
}

export function failActiveStep(steps: TransferStep[], errorMessage: string): TransferStep[] {
  return steps.map((step) => (step.state === "active" ? { ...step, state: "failed", errorMessage } : step));
}

export function findStep(steps: TransferStep[], name: TransferStepName) {
  return steps.find((step) => step.name === name) ?? null;
}

export function findFailedStep(steps: TransferStep[]) {
  return steps.find((step) => step.state === "failed") ?? null;
}
