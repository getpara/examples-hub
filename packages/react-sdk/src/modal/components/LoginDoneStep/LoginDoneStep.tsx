import { useEffect } from 'react';
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
      <Heading variant="headingS" weight="bold">
        Connected
      </Heading>
      {!hideWallets && (
        <WalletCards>
          {para.externalWalletConnectionType === 'CONNECTION_ONLY' ? (
            <ExternalWalletCard address={Object.values(para.externalWallets || {})[0]?.address ?? ''} />
          ) : (
            para.currentWalletIdsArray.map(([id, type]) => {
              return <WalletCard key={`${id}-${type}`} id={id} type={type} />;
            })
          )}
        </WalletCards>
      )}
    </StepContainer>
  );
};
