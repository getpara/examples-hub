import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModalStep } from '../../utils/steps.js';
import { getActions } from './actions.js';
import { OnRampConfig, OnRampPurchase } from '@usecapsule/web-sdk';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

type Flow = 'login' | 'signUp';

export interface OnModalStepChangeValue {
  previousStep: ModalStep;
  currentStep: ModalStep;
  canGoBack: boolean;
}

interface ModalState {
  step: ModalStep;
  flow: Flow | undefined;
  webAuthURLForLogin: string | undefined;
  webAuthURLForCreate: string | undefined;
  isFullyLoggedIn: boolean;
  onModalStepChange: (value: OnModalStepChangeValue) => void | undefined;
  onRampConfig: OnRampConfig | undefined;
  onRampPurchase: Partial<OnRampPurchase> | undefined;
  rampWidget: RampInstantSDK | undefined;
}

export interface ModalActions {
  resetState: () => void;
  setStep: (step: ModalStep) => void;
  decrementStep: () => void;
  hasPreviousStep: () => boolean;
  stepNumber: () => number;
  totalSteps: () => number;
  setFlow: (flow: Flow) => void;
  isLogin: () => boolean;
  setWebAuthURLForLogin: (url?: string) => void;
  setWebAuthURLForCreate: (url?: string) => void;
  setIsFullyLoggedIn: (isFullyLoggedIn: boolean) => void;
  setOnModalStepChange: (fn: (value: OnModalStepChangeValue) => void) => void;
  setOnRampConfig: (_: OnRampConfig | undefined) => void;
  setOnRampPurchase: (_: Partial<OnRampPurchase> | undefined) => void;
  setRampWidget: (_: RampInstantSDK | undefined) => void;
}

export type ModalStore = ModalState & ModalActions;

// Omitting step from default here since it's set dynamically when the modal opens and closes
export const DEFAULT_MODAL_STATE: Omit<ModalState, 'step' | 'onRampConfig'> = {
  flow: undefined,
  webAuthURLForLogin: undefined,
  webAuthURLForCreate: undefined,
  isFullyLoggedIn: false,
  onModalStepChange: undefined,
  onRampPurchase: undefined,
  rampWidget: undefined,
};

export const useModalStore = create<ModalStore>()(
  persist(
    (set, get) => ({
      step: ModalStep.SIGN_UP,
      onRampConfig: undefined,
      ...DEFAULT_MODAL_STATE,
      ...getActions(set, get),
    }),
    {
      name: '@CAPSULE/modalState',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        step: state.step,
        webAuthURLForLogin: state.webAuthURLForLogin,
        webAuthURLForCreate: state.webAuthURLForCreate,
        isFullyLoggedIn: state.isFullyLoggedIn,
        onRampConfig: state.onRampConfig,
        onRampPurchase: state.onRampPurchase,
        rampWidget: state.rampWidget,
      }),
    },
  ),
);
