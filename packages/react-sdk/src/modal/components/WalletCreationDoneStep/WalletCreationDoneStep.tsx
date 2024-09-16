import { CpslButton, CpslIcon, CpslInfoBox, CpslText } from '@usecapsule/react-components';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import styled from 'styled-components';
import { useBuyCryptoClick } from '../../hooks/useBuyCryptoClick.js';
import { WalletCard, WalletCards } from '../WalletCard/WalletCard.js';

interface WalletCreationDoneStepProps {
  twoFactorAuthEnabled?: boolean;
  recoverySecretStepEnabled?: boolean;
  onClose: () => void;
}

export const WalletCreationDoneStep = ({
  twoFactorAuthEnabled,
  recoverySecretStepEnabled,
  onClose,
}: WalletCreationDoneStepProps) => {
  const setStep = useModalStore(state => state.setStep);
  const isLogin = useModalStore(state => state.isLogin());
  const capsule = useCapsuleStore(state => state.capsule);
  const onBuyCryptoClick = useBuyCryptoClick();

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
      <Heading variant="headingS" weight="bold">
        Wallet Created
      </Heading>
      <InnerStepContainer>
        <WalletCards>
          {capsule.currentWalletIdsArray.map(([id, type]) => {
            return <WalletCard id={id} type={type} />;
          })}
        </WalletCards>
        {!recoverySecretStepEnabled && (
          <CpslInfoBox>
            <InfoBoxContent>
              <CpslIcon icon="shield" />
              <InlineText variant="bodyXS" weight="medium">
                Don’t lose your wallet.{' '}
                <a href="https://connect.usecapsule.com" target="blank">
                  <ClickableText color="primary" variant="bodyXS" weight="medium">
                    Visit Capsule Connect
                  </ClickableText>
                </a>{' '}
                to set up your Recovery Secret.
              </InlineText>
            </InfoBoxContent>
          </CpslInfoBox>
        )}
      </InnerStepContainer>
      <InnerStepContainer>
        <CpslButton fullWidth onClick={onBuyCryptoClick}>
          Buy Crypto
        </CpslButton>
        <CpslButton variant="secondary" fullWidth onClick={handleNext}>
          {twoFactorAuthEnabled ? 'Continue' : 'Done'}
        </CpslButton>
      </InnerStepContainer>
    </StepContainer>
  );
};

const InfoBoxContent = styled.div`
  display: flex;
  gap: 8px;

  cpsl-icon {
    --icon-color: var(--cpsl-color-foreground-0);
  }
`;

const InlineText = styled(CpslText)`
  display: inline-block;
  color: var(--cpsl-color-background-96);
`;

const ClickableText = styled(InlineText)`
  cursor: pointer;
  text-decoration: underline;
  color: var(--cpsl-color-text-primary);
`;
