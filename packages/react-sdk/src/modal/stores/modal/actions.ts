import { StoreApi } from 'zustand';
import { DEFAULT_MODAL_STATE, Flow, ModalActions, ModalStore } from './useModalStore.js';
import {
  AccountPreviousStep,
  GuestPreviousStep,
  LoginPreviousStep,
  ModalStep,
  SignUpPreviousStep,
} from '../../utils/steps.js';
import { TAuthLayout } from '../../types/modalProps.js';

function getPreviousStep(flow: Flow | undefined, step: ModalStep): ModalStep | undefined {
  return flow === 'account'
    ? AccountPreviousStep[step]
    : flow === 'login'
      ? LoginPreviousStep[step]
      : flow === 'guest'
        ? GuestPreviousStep[step]
        : SignUpPreviousStep[step];
}

export const getActions = (set: StoreApi<ModalStore>['setState'], get: StoreApi<ModalStore>['getState']): ModalActions => ({
  resetState: () => set(DEFAULT_MODAL_STATE),
  setOnModalStepChange: onModalStepChange => set({ onModalStepChange }),
  setRecoveryShare: recoveryShare => set({ recoveryShare }),
  setStep: step => {
    const onModalStepChange = get().onModalStepChange;
    const previousStep = get().step;

    set({ step });

    onModalStepChange?.({ previousStep, currentStep: step, canGoBack: get().hasPreviousStep() });
  },
  decrementStep: () => {
    const currentStep = get().step;
    const onRampStep = get().onRampStep;
    const flow = get().flow;

    if ([ModalStep.ADD_FUNDS_BUY, ModalStep.ADD_FUNDS_WITHDRAW].includes(currentStep) && onRampStep > 0) {
      set({ onRampStep: onRampStep - 1 });
      return;
    }

    if (!flow) {
      return;
    }

    const onModalStepChange = get().onModalStepChange;
    const signupState = get().getSignupState();
    const iFrameUrl = get().iFrameUrl;
    const refs = get().refs;

    let prevStep = getPreviousStep(flow, currentStep);

    if (currentStep === ModalStep.PASSWORD_CREATION && iFrameUrl && !signupState?.passkeyUrl) {
      prevStep = ModalStep.AUTH_MAIN;
    }

    if (currentStep === ModalStep.EX_WALLET_SELECTED) {
      set({ selectedExternalWalletId: undefined, isExternalWalletConnecting: false, externalWalletError: undefined });
    }

    if (prevStep) {
      set({
        authStepRoute: undefined,
        step: prevStep,
        stepDirection: -1,
        ...(prevStep === ModalStep.AUTH_MAIN && { flow: undefined }),
      });

      onModalStepChange?.({ previousStep: currentStep, currentStep: prevStep, canGoBack: get().hasPreviousStep() });
    }

    refs.popupWindow.current?.close();
    refs.popupWindow.current = null;
  },
  hasPreviousStep: () => {
    const flow = get().flow;
    const currentStep = get().step;
    const onRampStep = get().onRampStep;

    if ([ModalStep.ADD_FUNDS_BUY, ModalStep.ADD_FUNDS_WITHDRAW].includes(currentStep) && onRampStep > 0) {
      return true;
    }

    return !!getPreviousStep(flow, currentStep);
  },
  setFlow: flow => set({ flow }),
  isLogin: () => get().flow === 'login',
  isAccount: () => get().flow === 'account',
  setAuthState: authState => {
    let flow = get().flow,
      newFlow;

    switch (authState?.stage) {
      case 'login':
        newFlow = 'login';
        break;
      case 'signup':
      case 'verify':
        newFlow = flow === 'guest' ? 'guest' : 'signup';
        break;
      default:
        break;
    }

    set({ authState, ...(newFlow ? { flow: newFlow } : {}) });
  },
  getVerifyState: () => {
    const authState = get().authState;
    return authState?.stage === 'verify' ? authState : undefined;
  },
  getLoginState: () => {
    const authState = get().authState;
    return authState?.stage === 'login' ? authState : undefined;
  },
  getSignupState: () => {
    const authState = get().authState;
    return authState?.stage === 'signup' ? authState : undefined;
  },
  setOnRampPurchase: onRampPurchase =>
    set(state => ({ onRampPurchase: { ...(state.onRampPurchase || {}), ...onRampPurchase } })),
  setOnRampConfig: onRampConfig => set({ onRampConfig }),
  setOnRampStep: onRampStep => set({ onRampStep }),
  setIsFullyLoggedIn: isFullyLoggedIn => set({ isFullyLoggedIn }),
  setAccountAddFundTab: accountAddFundTab => set({ accountAddFundTab }),
  setGuestAddFundsTab: guestAddFundsTab => set({ guestAddFundsTab }),
  setSelectedExternalWalletId: selectedExternalWalletId => set({ selectedExternalWalletId }),
  setIsExternalWalletConnecting: isExternalWalletConnecting => set({ isExternalWalletConnecting }),
  setExternalWalletError: externalWalletError => set({ externalWalletError }),
  setIsUsingMobileConnector: isUsingMobileConnector => set({ isUsingMobileConnector }),
  setStepDirection: stepDirection => set({ stepDirection }),
  setFarcasterConnectUri: farcasterConnectUri => set({ farcasterConnectUri }),
  setTwoFactorStatus: twoFactorStatus => set({ twoFactorStatus }),
  setIFrameUrl: iFrameUrl => set({ iFrameUrl }),
  setIsIFrameReady: isIFrameReady => set({ isIFrameReady }),
  setAuthLayout: authLayout => {
    const types: string[] = [];
    const uniqueLayouts: TAuthLayout[] = [];

    authLayout.map(layout => {
      const type = layout.split(':')[0];

      if (!types.includes(type)) {
        uniqueLayouts.push(layout);

        types.push(type);
      } else {
        console.warn(`${layout} is a duplicate ${type} layout type. Please remove the duplicate type from your config.`);
      }
    });

    set({ authLayout: uniqueLayouts });
  },
  setAuthStepRoute: authStepRoute => set({ authStepRoute }),
  setIsPasskeySupported: isPasskeySupported => set({ isPasskeySupported }),
});
