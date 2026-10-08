import { useCallback, useState } from "react";
import type { StepListItem } from "@/components/ui/StepList";
import { CANTON_STEP_TITLES } from "@/lib/cantonSteps";

interface CantonStepCompletion {
  partyId: string | null;
  preapprovalUpdateId: string | null;
  tapUpdateId: string | null;
}

export function useCantonStepNavigation({ partyId, preapprovalUpdateId, tapUpdateId }: CantonStepCompletion) {
  const [requestedIndex, setRequestedIndex] = useState(0);
  const hasParty = Boolean(partyId);
  const viewedIndex = hasParty ? requestedIndex : 0;
  const completions = [hasParty, Boolean(preapprovalUpdateId), Boolean(tapUpdateId), false];

  const items: StepListItem[] = CANTON_STEP_TITLES.map((title, index) => ({
    title,
    isDone: completions[index],
    isCurrent: index === viewedIndex,
    status: completions[index] ? "Done" : index === viewedIndex ? "Current" : hasParty ? "Ready" : "After onboarding",
  }));

  const goToNext = useCallback(() => {
    setRequestedIndex(Math.min(viewedIndex + 1, CANTON_STEP_TITLES.length - 1));
  }, [viewedIndex]);

  const goToPrevious = useCallback(() => {
    setRequestedIndex(Math.max(viewedIndex - 1, 0));
  }, [viewedIndex]);

  return {
    items,
    viewedIndex,
    nextTitle: hasParty ? (CANTON_STEP_TITLES[viewedIndex + 1] ?? null) : null,
    previousTitle: viewedIndex > 0 ? CANTON_STEP_TITLES[viewedIndex - 1] : null,
    goToNext,
    goToPrevious,
  };
}
