import { styled } from 'styled-components';
import { AuthLoginStep } from '../../../constants';
import { ModalFooter } from '../../../components/ModalFooter';
import { ManualLoginStep } from './ManualLoginStep';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalSuccess } from '../../../components/ModalSuccess';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { EnterPasswordStep } from './EnterPasswordStep';
import { BiometricLocationHint } from '@getpara/user-management-client';
import { LoginFailedStep } from './LoginFailedStep';
import { LoginFailedTroubleshootingStep } from './LoginFailedTroubleshootingStep';
import { SuccessFromKnownDeviceStep } from './SuccessFromKnownDeviceStep';
import { EnterPINStep } from './EnterPINStep';
import { AuthVerificationStep } from './AuthVerificationStep';
import { isIFramed } from '../../../utils/isIFramed';
import { OAuthCallback } from './OAuthCallback';
import { OTP } from './OTP';
import { Farcaster } from './Farcaster';
import { TelegramLogin } from '../../TelegramLogin/TelegramLogin';
import { BasicLoginUpgrade } from '../../BasicLoginUpgrade/BasicLoginUpgrade';
import { ExternalWallet } from './ExternalWallet';

interface BodyProps {
  addDeviceUrl?: string;
  step: AuthLoginStep;
  onLoginClick: () => void;
  onLoginWithPasswordClick: (password: string, isPIN?: boolean) => void;
  onLoginFromAnotherDevice: () => Promise<void>;
  setStep: (step: AuthLoginStep) => void;
  onAddPasskeyClick: () => void;
  sessionLookupId: string;
  biometricLocationHints: BiometricLocationHint[];
  loginWithPasswordError?: string;
  isKnownDeviceLogin: boolean;
  isAddingDevice: boolean;
  isEmbedded?: boolean;
  postLogin: () => Promise<void>;
  isSwitchingWallets?: boolean;
  onBasicLoginUpgradeClick: () => Promise<void>;
  onSkipBasicLoginUpgradeClick: (_?: boolean) => Promise<void>;
  onBasicLoginPostLogin: () => Promise<void>;
}

export const Body = ({
  addDeviceUrl,
  step,
  onLoginClick,
  onLoginWithPasswordClick,
  onLoginFromAnotherDevice,
  setStep,
  onAddPasskeyClick,
  biometricLocationHints,
  loginWithPasswordError,
  isKnownDeviceLogin,
  isAddingDevice,
  isEmbedded,
  postLogin,
  isSwitchingWallets = false,
  onBasicLoginUpgradeClick,
  onSkipBasicLoginUpgradeClick,
  onBasicLoginPostLogin,
}: BodyProps) => {
  const { partner } = useModalOutletContext();

  const Content = () => {
    switch (step) {
      case AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING: {
        return <LoginFailedTroubleshootingStep setStep={setStep} />;
      }
      case AuthLoginStep.LOGIN_FAILED: {
        return (
          <LoginFailedStep
            onLoginClick={onLoginClick}
            onLoginFromAnotherDevice={onLoginFromAnotherDevice}
            biometricLocationHints={biometricLocationHints}
            urlForKnownDeviceLogin={addDeviceUrl}
          />
        );
      }
      case AuthLoginStep.MANUAL_LOGIN: {
        return <ManualLoginStep onLoginClick={onLoginClick} />;
      }
      case AuthLoginStep.WAITING: {
        return (
          <ModalLoading
            heading={
              isSwitchingWallets ? 'Please Wait...' : isAddingDevice ? 'Creating Passkey...' : 'Waiting for Passkey...'
            }
          />
        );
      }
      case AuthLoginStep.ENTER_PASSWORD: {
        return (
          <EnterPasswordStep
            isEmbedded={isEmbedded}
            error={loginWithPasswordError}
            onLoginClick={onLoginWithPasswordClick}
          />
        );
      }
      case AuthLoginStep.ENTER_PIN: {
        return (
          <EnterPINStep
            isEmbedded={isEmbedded}
            error={loginWithPasswordError}
            onLoginClick={onLoginWithPasswordClick}
            setStep={setStep}
          />
        );
      }
      case AuthLoginStep.SUCCESS: {
        return !isIFramed ? (
          <ModalSuccess
            heading="You’re Logged In!"
            subHeading={
              isEmbedded
                ? ''
                : isKnownDeviceLogin
                  ? 'You can close this window and return to your other device.'
                  : `If you are not automatically redirected, you can close this window and return to ${partner.displayName}.`
            }
          />
        ) : null;
      }
      case AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE: {
        return <SuccessFromKnownDeviceStep onAddPasskeyClick={onAddPasskeyClick} />;
      }
      case AuthLoginStep.AUTH_VERIFICATION: {
        return <AuthVerificationStep isEmbedded={isEmbedded} setStep={setStep} />;
      }
      case AuthLoginStep.OAUTH_CALLBACK: {
        return <OAuthCallback onLogin={postLogin} />;
      }
      case AuthLoginStep.OTP: {
        return <OTP onLogin={postLogin} />;
      }
      case AuthLoginStep.FARCASTER: {
        return <Farcaster onLogin={postLogin} />;
      }
      case AuthLoginStep.TELEGRAM: {
        return <TelegramLogin onLogin={postLogin} />;
      }
      case AuthLoginStep.BASIC_LOGIN_UPGRADE: {
        return (
          <BasicLoginUpgrade
            onUpgradeClick={onBasicLoginUpgradeClick}
            onSkipClick={onSkipBasicLoginUpgradeClick}
            onLogin={onBasicLoginPostLogin}
          />
        );
      }
      case AuthLoginStep.EXTERNAL_WALLET: {
        return <ExternalWallet onLogin={postLogin} />;
      }
    }
  };

  return (
    <Container>
      <InnerContainer $isTroubleshooting={step === AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING}>{Content()}</InnerContainer>
      {!isEmbedded && <ModalFooter step={step} setStep={setStep} />}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  height: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;

  max-height: calc(100% - var(--card-padding-top));
`;

const InnerContainer = styled.div<{ $isTroubleshooting: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: ${({ $isTroubleshooting }) => ($isTroubleshooting ? 'flex-start' : 'center')};
  flex-direction: column;
  gap: 8px;
  width: 100%;
  ${!isIFramed && 'padding: 0px 24px'}
  overflow: auto;
`;
