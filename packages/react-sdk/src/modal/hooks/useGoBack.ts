import { useExternalWallets } from '../providers/ExternalWalletContext.js';
import { useModalStore } from '../stores/index.js';
import { ModalStep } from '../utils/steps.js';

export const useGoBack = () => {
  const currentStep = useModalStore(state => state.step);
  const decrementStep = useModalStore(state => state.decrementStep);
  const resetState = useModalStore(state => state.resetState);
  const { setChainIdSwitchingTo } = useExternalWallets();

  const goBack = () => {
    decrementStep();
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
