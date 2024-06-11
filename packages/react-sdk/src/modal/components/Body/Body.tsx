import { styled } from 'styled-components';
import { ModalStep, NoIndicatorSteps } from '../../utils/steps.js';
import { SignUpStep } from '../SignUpStep/SignUpStep.js';
import { CpslAlert, CpslProgressIndicator } from '@usecapsule/react-components';
import { VerificationCodeStep } from '../VerificationCodeStep/VerificationCodeStep.js';
import { useModalStore, useThemeStore } from '../../stores/index.js';
import { BiometricLoginStep } from '../BiometricLoginStep/BiometricLoginStep.js';
import { Setup2FAStep } from '../Setup2FAStep/Setup2FAStep.js';
import { LoginDoneStep } from '../LoginDoneStep/LoginDoneStep.js';
import { OAuthMethod, OnRampConfig } from '@usecapsule/web-sdk';
import { AwaitingBiometricsStep } from '../AwaitingBiometricsStep/AwaitingBiometricsStep.js';
import { AwaitingWalletCreationStep } from '../AwaitingWalletCreationStep/AwaitingWalletCreationStep.js';
import { WalletCreationDoneStep } from '../WalletCreationDoneStep/WalletCreationDoneStep.js';
import { RecoverySecretStep } from '../RecoverySecretStep/RecoverySecretStep.js';
import { TwoFactorDoneStep } from '../TwoFactorDoneStep/TwoFactorDoneStep.js';
import { BiometricCreationStep } from '../BiometricCreationStep/BiometricCreationStep.js';
import { AwaitingOAuthStep } from '../AwaitingOAuthStep/AwaitingOAuthStep.js';
import { AddFunds } from '../AddFunds/AddFunds.js';
import { AddFundsAwaiting } from '../AddFundsAwaiting/AddFundsAwaiting.js';
import { AddFundsDone } from '../AddFundsDone/AddFundsDone.js';
import { VerificationCodeStepForPhone } from '../VerificationCodeStep/VerificationCodeStepForPhone.js';

interface BodyProps {
  oAuthMethods?: OAuthMethod[];
  recoveryShare: string;
  twoFactorAuthEnabled?: boolean;
  hasFinishedAnimation: boolean;
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  onClose: () => void;
  onRampConfig?: OnRampConfig;
}

export const Body = ({
  oAuthMethods,
  recoveryShare,
  twoFactorAuthEnabled,
  hasFinishedAnimation,
  disableEmailLogin,
  disablePhoneLogin,
  onClose,
}: BodyProps) => {
  const currentStep = useModalStore((state) => state.step);
  const stepNumber = useModalStore((state) => state.stepNumber());
  const totalSteps = useModalStore((state) => state.totalSteps());
  const isLogin = useModalStore((state) => state.isLogin());
  const onRampConfig = useModalStore((state) => state.onRampConfig);
  const appName = useThemeStore((state) => state.appName);

  const showProgressIndicator = !isLogin && !NoIndicatorSteps.includes(currentStep);

  const Content = () => {
    switch (currentStep) {
      case ModalStep.SIGN_UP:
      case ModalStep.SIGN_UP_ALL_OAUTH: {
        return (
          <SignUpStep
            oAuthMethods={oAuthMethods}
            disableEmailLogin={disableEmailLogin}
            disablePhoneLogin={disablePhoneLogin}
          />
        );
      }
      case ModalStep.VERIFICATION_CODE: {
        return <VerificationCodeStep />;
      }
      case ModalStep.VERIFICATION_CODE_FOR_PHONE: {
        return <VerificationCodeStepForPhone />;
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
      case ModalStep.ADD_FUNDS: {
        return <AddFunds />;
      }
      case ModalStep.ADD_FUNDS_AWAITING: {
        return <AddFundsAwaiting />;
      }
      case ModalStep.ADD_FUNDS_SUCCESS: {
        return <AddFundsDone isSuccess onClose={onClose} />;
      }
      case ModalStep.ADD_FUNDS_FAILURE: {
        return <AddFundsDone onClose={onClose} />;
      }
    }
  };

  return (
    <BodyContainer slot="body">
      {showProgressIndicator && <StyledCpslProgressIndicator step={stepNumber - 1} totalSteps={totalSteps} />}
      {onRampConfig?.testMode &&
        [
          ModalStep.ADD_FUNDS,
          ModalStep.ADD_FUNDS_AWAITING,
          ModalStep.ADD_FUNDS_FAILURE,
          ModalStep.ADD_FUNDS_SUCCESS,
        ].includes(currentStep) && (
          <CpslAlert>
            <div>
              This Capsule Modal is configured to run on-ramp services in <b>test mode</b> only, for development purposes. If
              you are a user of {appName}, please contact support.
            </div>
          </CpslAlert>
        )}
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
