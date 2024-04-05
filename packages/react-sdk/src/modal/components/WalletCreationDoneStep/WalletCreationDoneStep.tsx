import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import {
  Heading,
  MainContainer,
  Hero,
  ButtonWithIconContainer,
} from '../common';
import { useCapsuleStore, useModalStore } from '../../stores';
import { ModalStep } from '../../utils/steps';

interface WalletCreationDoneStepProps {
  twoFactorAuthEnabled?: boolean;
  onClose: () => void;
}

export const WalletCreationDoneStep = ({
  twoFactorAuthEnabled,
  onClose,
}: WalletCreationDoneStepProps) => {
  const setStep = useModalStore((state) => state.setStep);
  const isLogin = useModalStore((state) => state.isLogin());
  const capsule = useCapsuleStore((state) => state.capsule);

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
    <>
      <Hero icon="heroWallet" />
      <MainContainer>
        <Heading>
          <span>Wallet Created!</span>
        </Heading>
      </MainContainer>
      <CpslButton onClick={handleNext}>
        {twoFactorAuthEnabled ? (
          <ButtonWithIconContainer>
            Continue
            <CpslIcon icon="arrowNarrow" />
          </ButtonWithIconContainer>
        ) : (
          <ButtonWithIconContainer>
            <CpslIcon icon="check" />
            Done
          </ButtonWithIconContainer>
        )}
      </CpslButton>
    </>
  );
};
