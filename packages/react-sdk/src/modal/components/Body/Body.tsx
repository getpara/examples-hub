import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { CpslAlert, CpslText } from '@usecapsule/react-components';
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
import { AddFundsAwaiting, AddFundsDone, AddFunds } from '../AddFunds/index.js';
import FarcasterOAuthStep from '../OAuth/FarcasterOAuthStep.js';
import { Header } from '../Header/Header.js';
import { AuthMainStep } from '../AuthMainStep/AuthMainStep.js';
import { BODY_MOTION_VARIANTS, BODY_TRANSITION, MOBILE_SIZE } from '../../constants/constants.js';
import { Account } from '../Account/Account.js';
import { AuthOptions } from '../AuthOptions/AuthOptions.js';
import { ExternalWallets } from '../ExternalWallets/ExternalWallets.js';
import { ExternalWalletStep } from '../ExternalWalletStep/ExternalWalletStep.js';
import { Hero } from '../Hero/Hero.js';
import { AnimatedHeightWrapper } from './AnimatedHeightWrapper.js';
import { ChainSwitch } from '../ChainSwitch/ChainSwitch.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Controls } from '../Controls/Controls.js';

interface BodyProps {
  oAuthMethods?: OAuthMethod[];
  twoFactorAuthEnabled?: boolean;
  recoverySecretStepEnabled?: boolean;
  hasFinishedAnimation: boolean;
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  onClose: () => void;
  onRampConfig?: OnRampConfig;
}

export const Body = ({
  oAuthMethods,
  twoFactorAuthEnabled,
  recoverySecretStepEnabled,
  hasFinishedAnimation,
  disableEmailLogin,
  disablePhoneLogin,
  onClose,
}: BodyProps) => {
  const currentStep = useModalStore(state => state.step);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const stepDirection = useModalStore(state => state.stepDirection);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const appName = useThemeStore(state => state.appName);

  const Content = () => {
    switch (currentStep) {
      case ModalStep.AUTH_MAIN: {
        return (
          <AuthMainStep
            oAuthMethods={oAuthMethods}
            disableEmailLogin={disableEmailLogin}
            disablePhoneLogin={disablePhoneLogin}
          />
        );
      }
      case ModalStep.EX_WALLET_MORE: {
        return <ExternalWallets />;
      }
      case ModalStep.AUTH_MORE: {
        return (
          <AuthOptions
            oAuthMethods={oAuthMethods}
            disableEmailLogin={disableEmailLogin}
            disablePhoneLogin={disablePhoneLogin}
          />
        );
      }
      case ModalStep.VERIFICATIONS: {
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
        return (
          <WalletCreationDoneStep
            twoFactorAuthEnabled={twoFactorAuthEnabled}
            recoverySecretStepEnabled={recoverySecretStepEnabled}
            onClose={onClose}
          />
        );
      }
      case ModalStep.SECRET: {
        return <RecoverySecretStep />;
      }
      case ModalStep.TWO_FACTOR_DONE: {
        return <TwoFactorDoneStep onClose={onClose} />;
      }
      case ModalStep.BIOMETRIC_CREATION: {
        return <BiometricCreationStep />;
      }
      case ModalStep.AWAITING_OAUTH: {
        return <AwaitingOAuthStep />;
      }
      case ModalStep.FARCASTER_OAUTH: {
        return <FarcasterOAuthStep />;
      }
      case ModalStep.ADD_FUNDS: {
        return <AddFunds hasFinishedAnimation={hasFinishedAnimation} />;
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
      case ModalStep.ACCOUNT_MAIN: {
        return <Account onClose={onClose} />;
      }
      case ModalStep.EX_WALLET_SELECTED: {
        return <ExternalWalletStep />;
      }
      case ModalStep.CHAIN_SWITCH: {
        return <ChainSwitch />;
      }
    }
  };

  return (
    <Container slot="body" data-testid="modal-content">
      <Controls onClose={onClose} />
      <Header />
      <AnimatedWrapper>
        <AnimatePresence
          mode="popLayout"
          initial={false}
          onExitComplete={() => {
            setStepDirection(1);
          }}
          custom={stepDirection}
        >
          <BodyContainer
            key={currentStep}
            custom={stepDirection}
            variants={BODY_MOTION_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={BODY_TRANSITION}
          >
            <Hero />
            <InnerContainer>
              {onRampConfig?.testMode &&
                [
                  ModalStep.ADD_FUNDS,
                  ModalStep.ADD_FUNDS_AWAITING,
                  ModalStep.ADD_FUNDS_FAILURE,
                  ModalStep.ADD_FUNDS_SUCCESS,
                ].includes(currentStep) && (
                  <CpslAlert>
                    <CpslText variant="bodyS">
                      This Capsule Modal is configured to run on-ramp services in <b>test mode</b> only, for development
                      purposes. If you are a user of {appName}, please contact support.
                    </CpslText>
                  </CpslAlert>
                )}
              {Content()}
            </InnerContainer>
          </BodyContainer>
        </AnimatePresence>
      </AnimatedWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

const AnimatedWrapper = styled(AnimatedHeightWrapper)`
  margin-top: -16px;
`;

const BodyContainer = styled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  will-change: auto !important;
`;

const InnerContainer = styled.div`
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  padding: 72px 72px 32px;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: 72px 16px 0px;
  }
`;
