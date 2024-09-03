import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModalStep } from '../../utils/steps.js';
import { getActions } from './actions.js';
import { Network, OnRampConfig, OnRampPurchase } from '@usecapsule/web-sdk';
import { Tab as AddFundsTabType } from '../../components/AddFunds/AddFunds.js';

type Flow = 'login' | 'signUp' | 'account';

export interface OnModalStepChangeValue {
  previousStep: ModalStep;
  currentStep: ModalStep;
  canGoBack: boolean;
}

interface ModalState {
  step: ModalStep;
  stepDirection: 1 | -1;
  flow: Flow | undefined;
  webAuthURLForLogin: string | undefined;
  webAuthURLForCreate: string | undefined;
  onModalStepChange: (value: OnModalStepChangeValue) => void | undefined;
  onRampConfig: OnRampConfig | undefined;
  onRampPurchase: Partial<OnRampPurchase> | undefined;
  networks: Network[];
  loginWindow: Window | undefined;
  isFullyLoggedIn: boolean;
  accountAddFundTab?: AddFundsTabType;
  selectedExternalWalletId?: string;
  isUsingMobileConnector?: boolean;
  isExternalWalletConnecting?: boolean;
  externalWalletError?: string[];
}

export interface ModalActions {
  resetState: () => void;
  setStep: (step: ModalStep) => void;
  decrementStep: () => void;
  hasPreviousStep: () => boolean;
  setFlow: (flow?: Flow) => void;
  isLogin: () => boolean;
  isAccount: () => boolean;
  setWebAuthURLForLogin: (url?: string) => void;
  setWebAuthURLForCreate: (url?: string) => void;
  setOnModalStepChange: (fn: (value: OnModalStepChangeValue) => void) => void;
  setOnRampConfig: (_: OnRampConfig | undefined) => void;
  setOnRampPurchase: (_: Partial<OnRampPurchase> | undefined) => void;
  setNetworks: (_: Network[] | undefined) => void;
  setLoginWindow: (_: Window | undefined) => void;
  setIsFullyLoggedIn: (isFullyLoggedIn: boolean) => void;
  setAccountAddFundTab: (accountAddFundTab: AddFundsTabType) => void;
  setSelectedExternalWalletId: (id?: string) => void;
  setIsUsingMobileConnector: (isUsingMobileConnector?: boolean) => void;
  setIsExternalWalletConnecting: (isExternalWalletConnecting: boolean) => void;
  setExternalWalletError: (externalWalletError?: string[]) => void;
  setStepDirection: (stepDirection: 1 | -1) => void;
}

export type ModalStore = ModalState & ModalActions;

// Omitting step from default here since it's set dynamically when the modal opens and closes
export const DEFAULT_MODAL_STATE: Omit<ModalState, 'step' | 'onRampConfig'> = {
  flow: undefined,
  stepDirection: 1,
  webAuthURLForLogin: undefined,
  webAuthURLForCreate: undefined,
  onModalStepChange: undefined,
  onRampPurchase: undefined,
  networks: [Network.ETHEREUM],
  loginWindow: undefined,
  isFullyLoggedIn: false,
  accountAddFundTab: undefined,
  isExternalWalletConnecting: false,
  externalWalletError: undefined,
};

export const useModalStore = create<ModalStore>()(
  persist(
    (set, get) => ({
      step: ModalStep.AUTH_MAIN,
      onRampConfig: undefined,
      ...DEFAULT_MODAL_STATE,
      ...getActions(set, get),
    }),
    {
      version: 1,
      name: '@CAPSULE/modalState',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        step: state.step,
        webAuthURLForLogin: state.webAuthURLForLogin,
        webAuthURLForCreate: state.webAuthURLForCreate,
        onRampConfig: state.onRampConfig,
        onRampPurchase: state.onRampPurchase,
        networks: state.networks,
        selectedExternalWalletId: state.selectedExternalWalletId,
        isUsingMobileConnector: state.isUsingMobileConnector,
      }),
    },
  ),
);
