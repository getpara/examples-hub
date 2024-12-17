import { useExternalWallets } from '../providers/ExternalWalletContext.js';
import { useModalStore } from '../stores/index.js';
import { getAddFundsStep, ModalStep } from '../utils/steps.js';

export const useGoBack = () => {
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const decrementStep = useModalStore(state => state.decrementStep);
  const resetState = useModalStore(state => state.resetState);
  const { setChainIdSwitchingTo } = useExternalWallets();

  const goBack = () => {
    if (currentStep === ModalStep.ADD_FUNDS_AWAITING) {
      setStep(getAddFundsStep(accountAddFundTab));
    } else {
      decrementStep();
    }
    switch (currentStep) {
      case ModalStep.VERIFY_2FA:
      case ModalStep.BIOMETRIC_CREATION:
      case ModalStep.BIOMETRIC_LOGIN: {
        resetState();
        break;
      }
    }
    switch (currentStep) {
      case ModalStep.CHAIN_SWITCH: {
        setChainIdSwitchingTo();
        break;
      }
    }
  };

  return goBack;
};
