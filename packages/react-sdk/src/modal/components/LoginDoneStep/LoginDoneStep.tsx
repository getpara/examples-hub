import { useEffect } from 'react';
import { Heading, HeroIcon, StepContainer } from '../common.js';
import { ExternalWalletCard, WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const para = useInternalClient();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);

  useEffect(() => {
    setTimeout(() => {
      onClose();
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
          {para.isUsingExternalWallet() ? (
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
