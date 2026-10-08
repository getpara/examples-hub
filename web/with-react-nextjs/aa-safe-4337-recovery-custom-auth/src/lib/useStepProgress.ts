import { useCallback, useState } from "react";
import type { StepListItem } from "@/components/ui/StepList";

export interface StepDefinition {
  title: string;
  isComplete: boolean;
}

interface StepProgressLabels {
  done?: string;
  current?: string;
  upcoming?: string;
}

export function useStepProgress(steps: StepDefinition[], labels: StepProgressLabels = {}) {
  const { done = "Done", current = "Current", upcoming = "Locked" } = labels;
  const [requestedIndex, setRequestedIndex] = useState(0);

  const firstIncompleteIndex = steps.findIndex((step) => !step.isComplete);
  const currentIndex = firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;
  const viewedIndex = Math.min(requestedIndex, currentIndex);
  const nextStep = steps[viewedIndex]?.isComplete ? steps[viewedIndex + 1] : undefined;

  const items: StepListItem[] = steps.map((step, index) => ({
    title: step.title,
    isDone: step.isComplete,
    isCurrent: index === currentIndex,
    status: step.isComplete ? done : index === currentIndex ? current : upcoming,
  }));

  const goToNext = useCallback(() => {
    setRequestedIndex(viewedIndex + 1);
  }, [viewedIndex]);

  const restart = useCallback(() => {
    setRequestedIndex(0);
  }, []);

  return {
    items,
    currentIndex,
    viewedIndex,
    stepCount: steps.length,
    nextTitle: nextStep?.title ?? null,
    goToNext,
    restart,
  };
}
