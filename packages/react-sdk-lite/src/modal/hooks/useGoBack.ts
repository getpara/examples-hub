import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../stores/index.js';
import { getAddFundsStep, ModalStep } from '../utils/steps.js';

export const useGoBack = () => {
  const currentStep = useModalStore(state => state.step);
  const refs = useModalStore(state => state.refs);
  const setStep = useModalStore(state => state.setStep);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const decrementStep = useModalStore(state => state.decrementStep);
  const resetState = useModalStore(state => state.resetState);
  const { setChainIdSwitchingTo, disconnectExternalWallet } = useExternalWallets();
  const para = useInternalClient();
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);

  const goBack = () => {
    if (accountAddFundTab && currentStep === ModalStep.ADD_FUNDS_AWAITING) {
      setStep(getAddFundsStep(accountAddFundTab));
    } else {
      decrementStep();
    }

    switch (refs.currentStep.current) {
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
      case ModalStep.PASSWORD_CREATION: {
        const urlWithTimestamp = iFrameUrl ? `${iFrameUrl}${iFrameUrl.includes('?') ? '&' : '?'}_t=${Date.now()}` : '';

        // Reset the iFrame URL to ensure it reloads
        setIFrameUrl(urlWithTimestamp);
        setIsIFrameReady(false);
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
