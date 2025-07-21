import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModalStep } from '../../utils/steps.js';
import { getActions } from './actions.js';
import {
  AuthStateLogin,
  AuthStateSignup,
  AuthState,
  AuthStateVerify,
  OnRampConfig as OnRampConfigBase,
  OnRampPurchase,
  TWalletType,
  Setup2faResponse,
  LINKED_ACCOUNT_TYPES,
  SupportedAccountLinks,
} from '@getpara/web-sdk';
import { Tab as AddFundsTabType } from '../../components/AddFunds/AddFundsContext.js';
import { AuthLayout, TAuthLayout } from '../../types/modalProps.js';
import { createRef, MutableRefObject } from 'react';

export type Flow = AuthStateSignup['stage'] | AuthStateLogin['stage'] | 'account' | 'guest';

type ActiveWallet = [string | undefined, TWalletType | undefined];

export enum OnRampStep {
  SETTINGS = 0,
  PROVIDER = 1,
}

export type OnRampConfig = OnRampConfigBase & { testMode?: boolean };
export interface OnModalStepChangeValue {
  previousStep: ModalStep;
  currentStep: ModalStep;
  canGoBack: boolean;
}

interface ModalState {
  recoveryShare: string | null;
  step: ModalStep;
  stepDirection: 1 | -1;
  flow: Flow | undefined;
  authState: AuthState | undefined;
  onModalStepChange?: (value: OnModalStepChangeValue) => void | undefined;
  onRampConfig: OnRampConfig | undefined;
  onRampPurchase: Partial<OnRampPurchase> | undefined;
  onRampStep: OnRampStep;
  isFullyLoggedIn: boolean;
  accountAddFundTab?: AddFundsTabType;
  guestAddFundsTab?: AddFundsTabType;
  selectedExternalWallet?: { id: string; type: TWalletType };
  isUsingMobileConnector?: boolean;
  isExternalWalletConnecting?: boolean;
  externalWalletError?: string[];
  activeWallet: ActiveWallet | undefined;
  farcasterConnectUri: string | undefined;
  twoFactorStatus: Setup2faResponse | undefined;
  iFrameUrl: string | undefined;
  isIFrameReady: boolean | undefined;
  authLayout?: TAuthLayout[];
  authStepRoute: ModalStep | undefined;
  refs: {
    popupWindow: MutableRefObject<Window | null>;
    poll: MutableRefObject<{ action: 'login' | 'signup'; timeout: number } | null>;
    currentStep: MutableRefObject<ModalStep | null>;
    telegramIFrame: MutableRefObject<HTMLIFrameElement | null>;
    wasSignedIn: MutableRefObject<boolean | null>;
    initialFarcasterConnected: MutableRefObject<boolean | null>;
  };
  isPasskeySupported: boolean;
  accountLinkOptions: SupportedAccountLinks;
}

export interface ModalActions {
  resetState: () => void;
  setRecoveryShare: (recoveryShare: string | null) => void;
  setStep: (step: ModalStep) => void;
  setGuestAddFundsTab: (tab?: AddFundsTabType | undefined) => void;
  decrementStep: () => void;
  hasPreviousStep: () => boolean;
  setFlow: (flow?: Flow) => void;
  setAuthState: (authState?: AuthState | undefined) => void;
  getVerifyState: () => AuthStateVerify | undefined;
  getSignupState: () => AuthStateSignup | undefined;
  getLoginState: () => AuthStateLogin | undefined;
  isLogin: () => boolean;
  isAccount: () => boolean;
  setOnModalStepChange: (fn?: (value: OnModalStepChangeValue) => void) => void;
  setOnRampConfig: (_: OnRampConfig | undefined) => void;
  setOnRampPurchase: (_: Partial<OnRampPurchase> | undefined) => void;
  setOnRampStep: (_: OnRampStep) => void;
  setIsFullyLoggedIn: (isFullyLoggedIn: boolean) => void;
  setAccountAddFundTab: (accountAddFundTab?: AddFundsTabType) => void;
  setSelectedExternalWallet: (_?: { id: string; type: TWalletType }) => void;
  setIsUsingMobileConnector: (isUsingMobileConnector?: boolean) => void;
  setIsExternalWalletConnecting: (isExternalWalletConnecting: boolean) => void;
  setExternalWalletError: (externalWalletError?: string[]) => void;
  setStepDirection: (stepDirection: 1 | -1) => void;
  setFarcasterConnectUri: (_: string | undefined) => void;
  setTwoFactorStatus: (twoFactorStatus?: Setup2faResponse) => void;
  setIFrameUrl: (_?: string) => void;
  setIsIFrameReady: (_?: boolean) => void;
  setAuthLayout: (authLayout: TAuthLayout[]) => void;
  setAuthStepRoute: (_?: ModalStep) => void;
  setIsPasskeySupported: (_: boolean) => void;
  setAccountLinkOptions: (_: SupportedAccountLinks) => void;
}

export type ModalStore = ModalState & ModalActions;

// Omitting step from default here since it's set dynamically when the modal opens and closes
export const DEFAULT_MODAL_STATE: Omit<ModalState, 'step' | 'onRampConfig'> = {
  recoveryShare: null,
  flow: undefined,
  stepDirection: 1,
  authState: undefined,
  onModalStepChange: undefined,
  onRampPurchase: undefined,
  onRampStep: OnRampStep.SETTINGS,
  isFullyLoggedIn: false,
  accountAddFundTab: undefined,
  guestAddFundsTab: undefined,
  isExternalWalletConnecting: false,
  externalWalletError: undefined,
  activeWallet: [undefined, undefined],
  farcasterConnectUri: undefined,
  twoFactorStatus: undefined,
  iFrameUrl: undefined,
  isIFrameReady: undefined,
  authLayout: [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
  authStepRoute: undefined,
  refs: {
    popupWindow: createRef(),
    poll: createRef(),
    currentStep: createRef(),
    telegramIFrame: createRef(),
    wasSignedIn: createRef(),
    initialFarcasterConnected: createRef(),
  },
  isPasskeySupported: true,
  accountLinkOptions: [...LINKED_ACCOUNT_TYPES],
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
        authState: state.authState,
        onRampPurchase: state.onRampPurchase,
        selectedExternalWallet: state.selectedExternalWallet,
        isUsingMobileConnector: state.isUsingMobileConnector,
        isPasskeySupported: state.isPasskeySupported,
      }),
    },
  ),
);
