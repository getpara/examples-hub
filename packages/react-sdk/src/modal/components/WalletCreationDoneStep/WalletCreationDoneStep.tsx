import { CpslButton, CpslText } from '@getpara/react-components';
import { StepContainer, InnerStepContainer, HeroIcon } from '../common.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { WalletCard, WalletCards } from '../WalletCard/WalletCard.js';
import styled from 'styled-components';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useEffect, useState } from 'react';

interface WalletCreationDoneStepProps {
  twoFactorAuthEnabled?: boolean;
  onClose: () => void;
}

export const WalletCreationDoneStep = ({ twoFactorAuthEnabled, onClose }: WalletCreationDoneStepProps) => {
  const { isSetup2faPending } = useAuthActions();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const setStep = useModalStore(state => state.setStep);
  const isLogin = useModalStore(state => state.isLogin());
  const twoFactorStatus = useModalStore(state => state.twoFactorStatus);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const para = useInternalClient();

  const [isWaiting, setIsWaiting] = useState(false);

  const isOnRampConfigured = onRampConfig?.isBuyEnabled || onRampConfig?.isReceiveEnabled || onRampConfig?.isWithdrawEnabled;

  const onBypass2fa = () => {
    if (isLogin) {
      setStep(ModalStep.LOGIN_DONE); // Proceed to login done if 2FA is not enabled and this is a login flow
    } else {
      onClose();
    }
  };

  const handleNext = async () => {
    if (!twoFactorAuthEnabled) {
      onBypass2fa();
    }

    if (!twoFactorStatus) {
      if (isSetup2faPending) {
        setIsWaiting(true);
      }
    } else {
      if (twoFactorStatus.isSetup) {
        onBypass2fa();
      } else {
        setStep(ModalStep.SETUP_2FA);
      }
    }
  };

  useEffect(() => {
    if (isWaiting && !!twoFactorStatus) {
      setStep(ModalStep.SETUP_2FA);
    }
  }, [isWaiting, twoFactorStatus]);

  return (
    <StepContainer $wide>
      <CardContainer>
        {hideWallets ? (
          <>
            <HeroIcon icon="checkCircleFilled" />
            <CpslText variant="bodyM" color="secondary" weight="medium" style={{ marginTop: '16px' }}>
              Your account has been created.
            </CpslText>
          </>
        ) : (
          <WalletCards>
            {para.currentWalletIdsArray.map(([id, type]) => {
              return <WalletCard key={id} id={id} type={type} showAddFunds={isOnRampConfigured} />;
            })}
          </WalletCards>
        )}
      </CardContainer>
      <InnerStepContainer>
        <CpslButton fullWidth onClick={handleNext} disabled={isWaiting}>
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
