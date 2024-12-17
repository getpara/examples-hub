import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { CpslAlert, CpslIcon } from '@usecapsule/react-components';
import { VerificationCodeStep } from '../VerificationCodeStep/VerificationCodeStep.js';
import { useModalStore, useThemeStore } from '../../stores/index.js';
import { BiometricLoginStep } from '../BiometricLoginStep/BiometricLoginStep.js';
import { Setup2FAStep } from '../Setup2FAStep/Setup2FAStep.js';
import { LoginDoneStep } from '../LoginDoneStep/LoginDoneStep.js';
import { EnabledFlow, OAuthMethod } from '@usecapsule/web-sdk';
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
import { useEffect, useState } from 'react';
import { AwaitingPasswordStep } from '../AwaitingPasswordStep/AwaitingPasswordStep.js';
import { PasswordCreationStep } from '../PasswordCreationStep/PasswordCreationStep.js';

interface BodyProps {
  oAuthMethods?: OAuthMethod[];
  twoFactorAuthEnabled?: boolean;
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  onClose: () => void;
  createAccountWithPasskey: () => Promise<void>;
  createAccountWithPassword: () => Promise<void>;
}

const MIN_HEIGHT = {
  [ModalStep.ADD_FUNDS_AWAITING]: '680px',
};

export const Body = ({
  oAuthMethods,
  twoFactorAuthEnabled,
  disableEmailLogin,
  disablePhoneLogin,
  onClose,
  createAccountWithPasskey,
  createAccountWithPassword,
}: BodyProps) => {
  const currentStep = useModalStore(state => state.step);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const stepDirection = useModalStore(state => state.stepDirection);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const setAccountAddFundTab = useModalStore(state => state.setAccountAddFundTab);
  const appName = useThemeStore(state => state.appName);
  const embeddedModal = useThemeStore(state => state.embeddedModal);

  const [isTestModeAlert, setIsTestModeAlert] = useState(onRampConfig?.testMode);

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
      case ModalStep.AWAITING_PASSWORD_LOGIN:
      case ModalStep.AWAITING_PASSWORD_CREATION: {
        return <AwaitingPasswordStep />;
      }
      case ModalStep.AWAITING_WALLET_CREATION: {
        return <AwaitingWalletCreationStep />;
      }
      case ModalStep.WALLET_CREATION_DONE: {
        return <WalletCreationDoneStep twoFactorAuthEnabled={twoFactorAuthEnabled} onClose={onClose} />;
      }
      case ModalStep.SECRET: {
        return <RecoverySecretStep />;
      }
      case ModalStep.TWO_FACTOR_DONE: {
        return <TwoFactorDoneStep onClose={onClose} />;
      }
      case ModalStep.BIOMETRIC_CREATION: {
        return (
          <BiometricCreationStep
            handlePasswordClick={createAccountWithPassword}
            handlePasskeyClick={createAccountWithPasskey}
          />
        );
      }
      case ModalStep.PASSWORD_CREATION: {
        return <PasswordCreationStep />;
      }
      case ModalStep.AWAITING_OAUTH: {
        return <AwaitingOAuthStep />;
      }
      case ModalStep.FARCASTER_OAUTH: {
        return <FarcasterOAuthStep />;
      }
      case ModalStep.ADD_FUNDS_BUY:
      case ModalStep.ADD_FUNDS_RECEIVE:
      case ModalStep.ADD_FUNDS_WITHDRAW: {
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

  useEffect(() => {
    if (!isTestModeAlert && onRampConfig?.testMode) {
      setIsTestModeAlert(true);
    }
  }, [onRampConfig?.testMode]);

  useEffect(() => {
    switch (currentStep) {
      case ModalStep.ADD_FUNDS_BUY:
        setAccountAddFundTab(EnabledFlow.BUY);
        break;
      case ModalStep.ADD_FUNDS_RECEIVE:
        setAccountAddFundTab(EnabledFlow.RECEIVE);
        break;
      case ModalStep.ADD_FUNDS_WITHDRAW:
        setAccountAddFundTab(EnabledFlow.WITHDRAW);
        break;
      default:
        break;
    }
  }, [currentStep]);

  return (
    <Container slot="body" data-testid="modal-content">
      {!embeddedModal && (
        <>
          <Controls onClose={onClose} />
          <Header />
        </>
      )}
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
            key={
              ['ADD_FUNDS_BUY', 'ADD_FUNDS_RECEIVE', 'ADD_FUNDS_WITHDRAW'].includes(currentStep) ? 'ADD_FUNDS' : currentStep
            }
            custom={stepDirection}
            variants={BODY_MOTION_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={BODY_TRANSITION}
          >
            <Hero />
            <InnerContainer $embeddedModal={embeddedModal} step={currentStep}>
              {Content()}
              {onRampConfig?.testMode &&
                [
                  ModalStep.ADD_FUNDS_BUY,
                  ModalStep.ADD_FUNDS_WITHDRAW,
                  ModalStep.ADD_FUNDS_AWAITING,
                  ModalStep.ADD_FUNDS_FAILURE,
                  ModalStep.ADD_FUNDS_SUCCESS,
                ].includes(currentStep) &&
                isTestModeAlert &&
                accountAddFundTab !== EnabledFlow.RECEIVE && (
                  <TestModeAlert>
                    <div style={{ fontSize: '14px' }}>
                      This Capsule Modal is configured to run on-ramp services in <b>test mode</b> only, for development
                      purposes. If you are a user of {appName}, please contact support.
                      <CloseButton onClick={() => setIsTestModeAlert(false)}>
                        <CloseX icon="x" />
                      </CloseButton>
                    </div>
                  </TestModeAlert>
                )}
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

const InnerContainer = styled.div<{ $embeddedModal: boolean; step: ModalStep }>`
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;
  padding: ${({ $embeddedModal }) => ($embeddedModal ? '12px 0px 0px' : '72px 72px 32px')};
  min-height: ${({ step }) => MIN_HEIGHT[step] ?? 'auto'};
  height: ${({ step }) => MIN_HEIGHT[step] ?? 'auto'};

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: ${({ $embeddedModal }) => ($embeddedModal ? '12px 0px 0px' : '72px 16px 0px')};
  }

  cpsl-auth-modal.force-mobile-media & {
    padding: 72px 16px 0px;
  }
`;

const TestModeAlert = styled(CpslAlert)`
  --container-padding-end: 40px;
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 1000;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
`;

const CloseX = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-foreground-0);
`;
