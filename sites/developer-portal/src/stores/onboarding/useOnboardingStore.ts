import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActions } from './actions.js';

export enum OnboardingStep {
  ABOUT_YOU = 'ABOUT_YOU',
  ABOUT_PROJECT = 'ABOUT_PROJECT',
  ORG_INFO = 'ORG_INFO',
  PLAN_SELECT = 'PLAN_SELECT',
}

interface OnboardingState {
  userStepMap: Record<string, OnboardingStep>;
  userInputMap: Record<string, Record<string, string | string[] | null | undefined>>;
  logoFile: File | undefined;
  direction: 1 | -1;
}

export interface OnboardingActions {
  setStep: (_: string, step: OnboardingStep) => void;
  getStep: (_?: string) => OnboardingStep | undefined;
  setInput: (_: string, key: string, value: string | string[] | null | undefined) => void;
  getInput: (_?: string) => Record<string, string | string[] | null | undefined> | undefined;
  resetUser: (_?: string) => void;
  setLogoFile: (_?: File) => void;
  setDirection: (_: 1 | -1) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  userStepMap: {},
  userInputMap: {},
  logoFile: undefined,
  direction: 1,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ONBOARDING_STATE,
      ...getActions(set, get),
    }),
    {
      name: '@PARA-DEVELOPER-PORTAL/onboardingState',
      partialize: state => ({
        userStepMap: state.userStepMap,
        userInputMap: state.userInputMap,
      }),
    },
  ),
);
