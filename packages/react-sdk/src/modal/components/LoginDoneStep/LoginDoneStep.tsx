import { useEffect } from 'react';
import { Heading, HeroIcon, StepContainer } from '../common.js';
import { ExternalWalletCard, WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import { useCapsuleStore, useThemeStore } from '../../stores/index.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const hideWallets = useThemeStore(state => state.hideWallets);

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
          {capsule.isUsingExternalWallet() ? (
            <ExternalWalletCard address={capsule.currentExternalWalletAddresses?.[0]} />
          ) : (
            capsule.currentWalletIdsArray.map(([id, type]) => {
              return <WalletCard key={`${id}-${type}`} id={id} type={type} />;
            })
          )}
        </WalletCards>
      )}
    </StepContainer>
  );
};
