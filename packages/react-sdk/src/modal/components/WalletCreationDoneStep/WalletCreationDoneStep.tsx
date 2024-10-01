import { CpslButton } from '@usecapsule/react-components';
import { StepContainer, InnerStepContainer } from '../common.js';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import styled from 'styled-components';

interface WalletCreationDoneStepProps {
  twoFactorAuthEnabled?: boolean;
  onClose: () => void;
}

export const WalletCreationDoneStep = ({ twoFactorAuthEnabled, onClose }: WalletCreationDoneStepProps) => {
  const setStep = useModalStore(state => state.setStep);
  const isLogin = useModalStore(state => state.isLogin());
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const capsule = useCapsuleStore(state => state.capsule);

  const isOnRampConfigured = onRampConfig?.isBuyEnabled || onRampConfig?.isReceiveEnabled || onRampConfig?.isWithdrawEnabled;

  const handleNext = async () => {
    if (isLogin) {
      if (!twoFactorAuthEnabled) {
        setStep(ModalStep.LOGIN_DONE);
        return;
      }

      const is2FAComplete = await capsule.check2FAStatus();

      setStep(is2FAComplete ? ModalStep.LOGIN_DONE : ModalStep.SETUP_2FA);
    } else {
      if (twoFactorAuthEnabled) {
        setStep(ModalStep.SETUP_2FA);
      } else {
        onClose();
      }
    }
  };

  return (
    <StepContainer $wide>
      <CardContainer>
        <WalletCards>
          {capsule.currentWalletIdsArray.map(([id, type]) => {
            return <WalletCard key={id} id={id} type={type} showAddFunds={isOnRampConfigured} />;
          })}
        </WalletCards>
      </CardContainer>
      <InnerStepContainer>
        <CpslButton fullWidth onClick={handleNext}>
          {twoFactorAuthEnabled ? 'Continue' : 'Done'}
        </CpslButton>
      </InnerStepContainer>
    </StepContainer>
  );
};

const CardContainer = styled(InnerStepContainer)`
  min-height: 196px;
  justify-content: center;
`;
