import { useEffect } from 'react';
import { Heading, StepContainer } from '../common.js';
import { WalletCard } from '../WalletCard/WalletCard.js';
import { useCapsuleStore } from '../../stores/index.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const isExternalWallet = capsule.isUsingExternalWallet();

  useEffect(() => {
    setTimeout(() => {
      onClose();
    }, 800);
  }, []);

  return (
    <StepContainer>
      {isExternalWallet ? (
        <Heading variant="headingS" weight="bold">
          You're logged in!
        </Heading>
      ) : (
        <WalletCard />
      )}
    </StepContainer>
  );
};
