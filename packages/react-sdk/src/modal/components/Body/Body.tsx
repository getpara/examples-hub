import { styled } from 'styled-components';
import { ModalStep, NoIndicatorSteps } from '../../utils/steps.js';
import { SignUpStep } from '../SignUpStep/SignUpStep.js';
import { CpslProgressIndicator } from '@usecapsule/react-components';
import { VerificationCodeStep } from '../VerificationCodeStep/VerificationCodeStep.js';
import { useModalStore } from '../../stores/index.js';
import { BiometricLoginStep } from '../BiometricLoginStep/BiometricLoginStep.js';
import { Setup2FAStep } from '../Setup2FAStep/Setup2FAStep.js';
import { LoginDoneStep } from '../LoginDoneStep/LoginDoneStep.js';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { AwaitingBiometricsStep } from '../AwaitingBiometricsStep/AwaitingBiometricsStep.js';
import { AwaitingWalletCreationStep } from '../AwaitingWalletCreationStep/AwaitingWalletCreationStep.js';
import { WalletCreationDoneStep } from '../WalletCreationDoneStep/WalletCreationDoneStep.js';
import { RecoverySecretStep } from '../RecoverySecretStep/RecoverySecretStep.js';
import { TwoFactorDoneStep } from '../TwoFactorDoneStep/TwoFactorDoneStep.js';
import { BiometricCreationStep } from '../BiometricCreationStep/BiometricCreationStep.js';
import { AwaitingOAuthStep } from '../AwaitingOAuthStep/AwaitingOAuthStep.js';

interface BodyProps {
  oAuthMethods?: OAuthMethod[];
  recoveryShare: string;
  twoFactorAuthEnabled?: boolean;
  hasFinishedAnimation: boolean;
  disableEmailLogin: boolean;
  onClose: () => void;
}

export const Body = ({
  oAuthMethods,
  recoveryShare,
  twoFactorAuthEnabled,
  hasFinishedAnimation,
  disableEmailLogin,
  onClose,
}: BodyProps) => {
  const currentStep = useModalStore((state) => state.step);
  const stepNumber = useModalStore((state) => state.stepNumber());
  const totalSteps = useModalStore((state) => state.totalSteps());
  const isLogin = useModalStore((state) => state.isLogin());

  const showProgressIndicator = !isLogin && !NoIndicatorSteps.includes(currentStep);

  const Content = () => {
    switch (currentStep) {
      case ModalStep.SIGN_UP:
      case ModalStep.SIGN_UP_ALL_OAUTH: {
        return <SignUpStep oAuthMethods={oAuthMethods} disableEmailLogin={disableEmailLogin} />;
      }
      case ModalStep.VERIFICATION_CODE: {
        return <VerificationCodeStep />;
      }
      case ModalStep.BIOMETRIC_LOGIN: {
        return <BiometricLoginStep />;
      }
      case ModalStep.SETUP_2FA:
      case ModalStep.VERIFY_2FA: {
        return <Setup2FAStep onClose={onClose} />;
      }
      case ModalStep.LOGIN_DONE: {
        return <LoginDoneStep onClose={onClose} />;
      }
      case ModalStep.AWAITING_BIOMETRIC_LOGIN:
      case ModalStep.AWAITING_BIOMETRIC_CREATION: {
        return <AwaitingBiometricsStep />;
      }
      case ModalStep.AWAITING_WALLET_CREATION: {
        return <AwaitingWalletCreationStep />;
      }
      case ModalStep.WALLET_CREATION_DONE: {
        return <WalletCreationDoneStep twoFactorAuthEnabled={twoFactorAuthEnabled} onClose={onClose} />;
      }
      case ModalStep.SECRET: {
        return <RecoverySecretStep recoveryShare={recoveryShare} />;
      }
      case ModalStep.TWO_FACTOR_DONE: {
        return <TwoFactorDoneStep onClose={onClose} />;
      }
      case ModalStep.BIOMETRIC_CREATION: {
        return <BiometricCreationStep hasFinishedAnimation={hasFinishedAnimation} />;
      }
      case ModalStep.AWAITING_OAUTH: {
        return <AwaitingOAuthStep />;
      }
    }
  };

  return (
    <BodyContainer slot="body">
      {showProgressIndicator && <StyledCpslProgressIndicator step={stepNumber - 1} totalSteps={totalSteps} />}
      {Content()}
    </BodyContainer>
  );
};

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledCpslProgressIndicator = styled(CpslProgressIndicator)`
  width: 50%;
  align-self: center;
`;
