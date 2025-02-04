import { StoreApi } from 'zustand';
import { DEFAULT_MODAL_STATE, ModalActions, ModalStore } from './useModalStore.js';
import { AccountPreviousStep, LoginPreviousStep, ModalStep, SignUpPreviousStep } from '../../utils/steps.js';

export const getActions = (set: StoreApi<ModalStore>['setState'], get: StoreApi<ModalStore>['getState']): ModalActions => ({
  resetState: () => set(DEFAULT_MODAL_STATE),
  setOnModalStepChange: onModalStepChange => set({ onModalStepChange }),
  setStep: step => {
    const onModalStepChange = get().onModalStepChange;
    const previousStep = get().step;

    set({ step });

    onModalStepChange?.({ previousStep, currentStep: step, canGoBack: get().hasPreviousStep() });
  },
  decrementStep: () => {
    const onModalStepChange = get().onModalStepChange;
    const isLogin = get().flow === 'login';
    const isAccount = get().flow === 'account';
    const currentStep = get().step;
    const webAuthURLForCreate = get().webAuthURLForCreate;
    const iFrameUrl = get().iFrameUrl;

    let prevStep = (isAccount ? AccountPreviousStep : isLogin ? LoginPreviousStep : SignUpPreviousStep)[currentStep];

    if (currentStep === ModalStep.PASSWORD_CREATION && iFrameUrl && !webAuthURLForCreate) {
      prevStep = ModalStep.AUTH_MAIN;
    }
    if (currentStep === ModalStep.EX_WALLET_SELECTED) {
      set({ selectedExternalWalletId: undefined, isExternalWalletConnecting: false, externalWalletError: undefined });
    }

    if (prevStep) {
      set({ step: prevStep, stepDirection: -1 });

      onModalStepChange?.({ previousStep: currentStep, currentStep: prevStep, canGoBack: get().hasPreviousStep() });
    }
  },
  hasPreviousStep: () => {
    const isLogin = get().flow === 'login';
    const isAccount = get().flow === 'account';
    const currentStep = get().step;

    return !!(isAccount
      ? AccountPreviousStep[currentStep]
      : isLogin
        ? LoginPreviousStep[currentStep]
        : SignUpPreviousStep[currentStep]);
  },
  setPopupWindow: popupWindow => {
    set({ popupWindow });
  },
  setFlow: flow => set({ flow }),
  isLogin: () => get().flow === 'login',
  isAccount: () => get().flow === 'account',
  setWebAuthURLForLogin: url => set({ webAuthURLForLogin: url }),
  setWebAuthURLForCreate: url => set({ webAuthURLForCreate: url }),
  setPasswordUrlForLogin: url => set({ passwordUrlForLogin: url }),
  setSupportedAuthMethods: supportedAuthMethods => set({ supportedAuthMethods }),
  setOnRampPurchase: onRampPurchase =>
    set(state => ({ onRampPurchase: { ...(state.onRampPurchase || {}), ...onRampPurchase } })),
  setOnRampConfig: onRampConfig => set({ onRampConfig }),
  setIsFullyLoggedIn: isFullyLoggedIn => set({ isFullyLoggedIn }),
  setAccountAddFundTab: accountAddFundTab => set({ accountAddFundTab }),
  setSelectedExternalWalletId: selectedExternalWalletId => set({ selectedExternalWalletId }),
  setIsExternalWalletConnecting: isExternalWalletConnecting => set({ isExternalWalletConnecting }),
  setExternalWalletError: externalWalletError => set({ externalWalletError }),
  setIsUsingMobileConnector: isUsingMobileConnector => set({ isUsingMobileConnector }),
  setStepDirection: stepDirection => set({ stepDirection }),
  setFarcasterConnectUri: farcasterConnectUri => set({ farcasterConnectUri }),
  setBiometricLocationHints: biometricLocationHints => set({ biometricLocationHints }),
  setIFrameUrl: iFrameUrl => set({ iFrameUrl }),
  setIsIFrameReady: isIFrameReady => set({ isIFrameReady }),
});
