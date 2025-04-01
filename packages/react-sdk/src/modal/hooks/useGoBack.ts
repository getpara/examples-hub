import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../stores/index.js';
import { getAddFundsStep, ModalStep } from '../utils/steps.js';

export const useGoBack = () => {
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const decrementStep = useModalStore(state => state.decrementStep);
  const resetState = useModalStore(state => state.resetState);
  const { setChainIdSwitchingTo, disconnectExternalWallet } = useExternalWallets();
  const para = useInternalClient();

  const goBack = () => {
    if (accountAddFundTab && currentStep === ModalStep.ADD_FUNDS_AWAITING) {
      setStep(getAddFundsStep(accountAddFundTab));
    } else {
      decrementStep();
    }
    switch (currentStep) {
      case ModalStep.AUTH_MAIN:
      case ModalStep.AUTH_MORE:
      case ModalStep.EX_WALLET_SELECTED:
      case ModalStep.EXTERNAL_WALLET_VERIFICATION: {
        resetState();
        if (para.isExternalWalletAuth) {
          disconnectExternalWallet();
        }

        break;
      }
      case ModalStep.CHAIN_SWITCH: {
        setChainIdSwitchingTo();
        break;
      }
    }
  };

  return goBack;
};
