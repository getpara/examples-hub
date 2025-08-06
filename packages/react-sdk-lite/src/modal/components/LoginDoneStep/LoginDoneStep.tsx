import { useEffect, useMemo } from 'react';
import { Heading, HeroIcon, StepContainer } from '../common.js';
import { ExternalWalletCard, WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const para = useInternalClient();
  const bareModal = useStore(state => state.modalConfig?.bareModal);
  const setStep = useModalStore(state => state.setStep);
  const setFlow = useModalStore(state => state.setFlow);
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);

  const content = useMemo(() => {
    if (para.externalWalletConnectionType === 'CONNECTION_ONLY' || para.externalWalletConnectionType === 'VERIFICATION') {
      return (
        <ExternalWalletCard address={Object.values(para.externalWallets || {})[0]?.address ?? ''} showAddFunds={false} />
      );
    }

    const { id, type } = Object.values(para.wallets || {})[0] || {};

    if (!id || !type) return null;

    return <WalletCard key={`${id}-${type}`} id={id} type={type} showAddFunds={false} />;
  }, [para.externalWalletConnectionType, para.externalWallets, para.wallets]);

  useEffect(() => {
    setTimeout(() => {
      if (bareModal) {
        setFlow('account');
        setStep(ModalStep.ACCOUNT_MAIN);
      } else {
        onClose();
      }
    }, 1600);
  }, []);

  return (
    <StepContainer>
      <HeroIcon icon="checkCircleFilled" />
      <Heading>Connected</Heading>
      {!hideWallets && <WalletCards>{content}</WalletCards>}
    </StepContainer>
  );
};
