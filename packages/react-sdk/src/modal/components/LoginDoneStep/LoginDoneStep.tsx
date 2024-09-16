import { useEffect } from 'react';
import { StepContainer } from '../common.js';
import { WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import { useCapsuleStore } from '../../stores/index.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const capsule = useCapsuleStore(state => state.capsule);

  useEffect(() => {
    setTimeout(() => {
      onClose();
    }, 800);
  }, []);

  return (
    <StepContainer>
      <WalletCards>
        {capsule.currentWalletIdsArray.map(([id, type]) => {
          return <WalletCard id={id} type={type} />;
        })}
      </WalletCards>
    </StepContainer>
  );
};
