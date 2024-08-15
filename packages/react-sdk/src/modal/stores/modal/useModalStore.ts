import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModalStep } from '../../utils/steps.js';
import { getActions } from './actions.js';
import { Network, OnRampConfig, OnRampPurchase } from '@usecapsule/web-sdk';

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
  onModalStepChange: (value: OnModalStepChangeValue) => void | undefined;
  onRampConfig: OnRampConfig | undefined;
  onRampPurchase: Partial<OnRampPurchase> | undefined;
  networks: Network[];
  loginWindow: Window | undefined;
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
  setOnModalStepChange: (fn: (value: OnModalStepChangeValue) => void) => void;
  setOnRampConfig: (_: OnRampConfig | undefined) => void;
  setOnRampPurchase: (_: Partial<OnRampPurchase> | undefined) => void;
  setNetworks: (_: Network[] | undefined) => void;
  setLoginWindow: (_: Window | undefined) => void;
}

export type ModalStore = ModalState & ModalActions;

// Omitting step from default here since it's set dynamically when the modal opens and closes
export const DEFAULT_MODAL_STATE: Omit<ModalState, 'step' | 'onRampConfig'> = {
  flow: undefined,
  webAuthURLForLogin: undefined,
  webAuthURLForCreate: undefined,
  onModalStepChange: undefined,
  onRampPurchase: undefined,
  networks: [Network.ETHEREUM],
  loginWindow: undefined,
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
      partialize: state => ({
        step: state.step,
        webAuthURLForLogin: state.webAuthURLForLogin,
        webAuthURLForCreate: state.webAuthURLForCreate,
        onRampConfig: state.onRampConfig,
        onRampPurchase: state.onRampPurchase,
        networks: state.networks,
      }),
    },
  ),
);
