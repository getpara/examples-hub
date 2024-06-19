import { StoreApi } from 'zustand';
import { DEFAULT_MODAL_STATE, ModalActions, ModalStore } from './useModalStore.js';
import {
  LoginModalStepNumber,
  LoginPreviousStep,
  ModalStep,
  SignUpModalStepNumber,
  SignUpPreviousStep,
} from '../../utils/steps.js';

export const getActions = (set: StoreApi<ModalStore>['setState'], get: StoreApi<ModalStore>['getState']): ModalActions => ({
  resetState: () => {
    set(DEFAULT_MODAL_STATE);
  },
  setOnModalStepChange: (onModalStepChange) => {
    set({ onModalStepChange });
  },
  setStep: (step) => {
    const onModalStepChange = get().onModalStepChange;
    const previousStep = get().step;

    set({ step });

    onModalStepChange?.({ previousStep, currentStep: step, canGoBack: get().hasPreviousStep() });
  },
  decrementStep: () => {
    const onModalStepChange = get().onModalStepChange;
    const onRampConfig = get().onRampConfig;
    const isLogin = get().flow === 'login';
    const isAutoOnRamp = onRampConfig?.providers.length === 1;
    const currentStep = get().step;

    const prevStep =
      isAutoOnRamp && currentStep === ModalStep.ADD_FUNDS_AWAITING
        ? ModalStep.LOGIN_DONE
        : (isLogin ? LoginPreviousStep : SignUpPreviousStep)[currentStep];

    if (prevStep) {
      set({ step: prevStep });

      onModalStepChange?.({ previousStep: currentStep, currentStep: prevStep, canGoBack: get().hasPreviousStep() });
    }
  },
  hasPreviousStep: () => {
    const isLogin = get().flow === 'login';
    const currentStep = get().step;
    return !!(isLogin ? LoginPreviousStep[currentStep] : SignUpPreviousStep[currentStep]);
  },
  stepNumber: () => {
    const isLogin = get().flow === 'login';
    const currentStep = get().step;
    const stepNumbers = isLogin ? LoginModalStepNumber : SignUpModalStepNumber;
    return stepNumbers[currentStep];
  },
  totalSteps: () => {
    const isLogin = get().flow === 'login';
    let numOfSkippedOptionalSteps = 0;

    // If no on ramp config is provided, remove extra steps
    if (!get().onRampConfig) {
      numOfSkippedOptionalSteps++;
    }

    const stepNumbersValues = Object.values(isLogin ? LoginModalStepNumber : SignUpModalStepNumber);
    return stepNumbersValues[stepNumbersValues.length - 1] - numOfSkippedOptionalSteps;
  },
  setFlow: (flow) => {
    set({ flow });
  },
  isLogin: () => {
    return get().flow === 'login';
  },
  setWebAuthURLForLogin: (url) => {
    set({ webAuthURLForLogin: url });
  },
  setWebAuthURLForCreate: (url) => {
    set({ webAuthURLForCreate: url });
  },
  setIsFullyLoggedIn: (isFullyLoggedIn) => {
    set({ isFullyLoggedIn });
  },
  setOnRampPurchase: (onRampPurchase) => {
    set((state) => ({ onRampPurchase: { ...(state.onRampPurchase || {}), ...onRampPurchase } }));
  },
  setRampWidget: (rampWidget) => {
    set({ rampWidget });
  },
  setOnRampConfig: (onRampConfig) => {
    set({ onRampConfig });
  },
});
