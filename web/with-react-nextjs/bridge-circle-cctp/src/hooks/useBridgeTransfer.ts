import { useCallback, useState } from "react";
import type { BridgeResult } from "@circle-fin/bridge-kit";
import type { BridgeAdapter } from "@/lib/bridgeAdapter";
import { retryBridge, runBridge, type BridgeEvent, type MintSigner } from "@/lib/bridgeKit";
import {
  activateFirstOpenStep,
  applyBridgeEvent,
  applyBridgeResult,
  createWaitingSteps,
  failActiveStep,
  findFailedStep,
  type TransferStep,
} from "@/lib/bridgeSteps";
import { summarizeErrorMessage } from "@/lib/errorSummary";

export type TransferPhase = "idle" | "running" | "success" | "failed";

interface BridgeTransferInput {
  adapter: BridgeAdapter | null;
  onSettled: () => void;
}

interface TransferRequest {
  amount: string;
  mintSigner: MintSigner;
}

const UNFINISHED_MESSAGE = "The transfer did not finish. Retry to resume from the last step.";

function describeFailure(result: BridgeResult, steps: TransferStep[]) {
  return summarizeErrorMessage(findFailedStep(steps)?.errorMessage ?? result.steps.find((step) => step.errorMessage)?.errorMessage) ?? UNFINISHED_MESSAGE;
}

export function useBridgeTransfer({ adapter, onSettled }: BridgeTransferInput) {
  const [phase, setPhase] = useState<TransferPhase>("idle");
  const [steps, setSteps] = useState<TransferStep[]>(createWaitingSteps);
  const [request, setRequest] = useState<TransferRequest | null>(null);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEvent = useCallback((event: BridgeEvent) => {
    setSteps((current) => applyBridgeEvent(current, event));
  }, []);

  const execute = useCallback(
    async (run: () => Promise<BridgeResult>, startingSteps: TransferStep[]) => {
      setSteps(startingSteps);
      setPhase("running");
      setErrorMessage(null);

      try {
        const bridgeResult = await run();
        const settledSteps = applyBridgeResult(startingSteps, bridgeResult);
        const isSuccess = bridgeResult.state === "success";

        setResult(bridgeResult);
        setSteps((current) => applyBridgeResult(current, bridgeResult));
        setPhase(isSuccess ? "success" : "failed");
        setErrorMessage(isSuccess ? null : describeFailure(bridgeResult, settledSteps));
        return isSuccess;
      } catch (error) {
        const message = (error instanceof Error ? summarizeErrorMessage(error.message) : null) ?? "The transfer failed.";

        setSteps((current) => failActiveStep(current, message));
        setPhase("failed");
        setErrorMessage(message);
        return false;
      } finally {
        onSettled();
      }
    },
    [onSettled]
  );

  const start = useCallback(
    async (amount: string, mintSigner: MintSigner) => {
      if (!adapter) {
        return false;
      }

      setRequest({ amount, mintSigner });
      setResult(null);
      return execute(() => runBridge(adapter, amount, mintSigner, handleEvent), activateFirstOpenStep(createWaitingSteps()));
    },
    [adapter, execute, handleEvent]
  );

  const retry = useCallback(async () => {
    if (!adapter) {
      return false;
    }

    if (result) {
      return execute(() => retryBridge(adapter, result, handleEvent), activateFirstOpenStep(steps));
    }

    return request ? start(request.amount, request.mintSigner) : false;
  }, [adapter, execute, handleEvent, request, result, start, steps]);

  return {
    phase,
    steps,
    request,
    result,
    errorMessage,
    isRunning: phase === "running",
    start,
    retry,
  };
}

export type BridgeTransfer = ReturnType<typeof useBridgeTransfer>;
