import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModalStep } from '../../utils/steps.js';
import { getActions } from './actions.js';
import { OnRampConfig as OnRampConfigBase, OnRampPurchase, WalletType } from '@getpara/web-sdk';
import { Tab as AddFundsTabType } from '../../components/AddFunds/AddFunds.js';
import { AuthMethod } from '@getpara/core-sdk';
import { BiometricLocationHint } from '@getpara/user-management-client';
import { AuthLayout, TAuthLayout } from '../../types/modalProps.js';

type Flow = 'login' | 'signUp' | 'account';

type ActiveWallet = [string | undefined, WalletType | undefined];

export type OnRampConfig = OnRampConfigBase & { testMode?: boolean };
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
  passwordUrlForLogin: string | undefined;
  supportedAuthMethods: Set<AuthMethod>;
  onModalStepChange?: (value: OnModalStepChangeValue) => void | undefined;
  onRampConfig: OnRampConfig | undefined;
  onRampPurchase: Partial<OnRampPurchase> | undefined;
  popupWindow: Window | undefined;
  isFullyLoggedIn: boolean;
  accountAddFundTab?: AddFundsTabType;
  selectedExternalWalletId?: string;
  isUsingMobileConnector?: boolean;
  isExternalWalletConnecting?: boolean;
  externalWalletError?: string[];
  activeWallet: ActiveWallet | undefined;
  farcasterConnectUri: string | undefined;
  biometricLocationHints: BiometricLocationHint[] | undefined;
  iFrameUrl: string | undefined;
  isIFrameReady: boolean | undefined;
  authLayout?: TAuthLayout[];
}

export interface ModalActions {
  resetState: () => void;
  setStep: (step: ModalStep) => void;
  decrementStep: () => void;
  hasPreviousStep: () => boolean;
  setFlow: (flow?: Flow) => void;
  isLogin: () => boolean;
  isAccount: () => boolean;
  setSupportedAuthMethods: (authMethods: Set<AuthMethod>) => void;
  setWebAuthURLForLogin: (url?: string) => void;
  setWebAuthURLForCreate: (url?: string) => void;
  setPasswordUrlForLogin: (url?: string) => void;
  setOnModalStepChange: (fn?: (value: OnModalStepChangeValue) => void) => void;
  setOnRampConfig: (_: OnRampConfig | undefined) => void;
  setOnRampPurchase: (_: Partial<OnRampPurchase> | undefined) => void;
  setPopupWindow: (_: Window | undefined) => void;
  setIsFullyLoggedIn: (isFullyLoggedIn: boolean) => void;
  setAccountAddFundTab: (accountAddFundTab?: AddFundsTabType) => void;
  setSelectedExternalWalletId: (id?: string) => void;
  setIsUsingMobileConnector: (isUsingMobileConnector?: boolean) => void;
  setIsExternalWalletConnecting: (isExternalWalletConnecting: boolean) => void;
  setExternalWalletError: (externalWalletError?: string[]) => void;
  setStepDirection: (stepDirection: 1 | -1) => void;
  setFarcasterConnectUri: (_: string | undefined) => void;
  setBiometricLocationHints: (_?: BiometricLocationHint[]) => void;
  setIFrameUrl: (_?: string) => void;
  setIsIFrameReady: (_?: boolean) => void;
  setAuthLayout: (authLayout: TAuthLayout[]) => void;
}

export type ModalStore = ModalState & ModalActions;

// Omitting step from default here since it's set dynamically when the modal opens and closes
export const DEFAULT_MODAL_STATE: Omit<ModalState, 'step' | 'onRampConfig'> = {
  flow: undefined,
  stepDirection: 1,
  webAuthURLForLogin: undefined,
  webAuthURLForCreate: undefined,
  passwordUrlForLogin: undefined,
  supportedAuthMethods: new Set<AuthMethod>(),
  onModalStepChange: undefined,
  onRampPurchase: undefined,
  popupWindow: undefined,
  isFullyLoggedIn: false,
  accountAddFundTab: undefined,
  isExternalWalletConnecting: false,
  externalWalletError: undefined,
  activeWallet: [undefined, undefined],
  farcasterConnectUri: undefined,
  biometricLocationHints: undefined,
  iFrameUrl: undefined,
  isIFrameReady: undefined,
  authLayout: [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
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
      name: '@PARA/modalState',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        step: state.step,
        webAuthURLForLogin: state.webAuthURLForLogin,
        webAuthURLForCreate: state.webAuthURLForCreate,
        passwordUrlForLogin: state.passwordUrlForLogin,
        biometricLocationHints: state.biometricLocationHints,
        onRampPurchase: state.onRampPurchase,
        selectedExternalWalletId: state.selectedExternalWalletId,
        isUsingMobileConnector: state.isUsingMobileConnector,
        supportedAuthMethods: state.supportedAuthMethods,
      }),
    },
  ),
);
