import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActions } from './actions.js';

export enum OnboardingStep {
  FORM = 'FORM',
  ORG_NAME = 'ORG_NAME',
  PLAN_SELECT = 'PLAN_SELECT',
}

interface OnboardingState {
  userStepMap: Record<string, OnboardingStep>;
}

export interface OnboardingActions {
  setStep: (userId: string, step: OnboardingStep) => void;
  getStep: (userId?: string) => OnboardingStep | undefined;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  userStepMap: {},
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ONBOARDING_STATE,
      ...getActions(set, get),
    }),
    {
      name: '@CAPSULE/onboardingState',
      partialize: state => ({
        userStepMap: state.userStepMap,
      }),
    },
  ),
);
