import { styled } from 'styled-components';
import { IFrameSteps, ModalStep } from '../../utils/steps.js';
import { CpslAlert, CpslIcon } from '@getpara/react-components';
import { VerificationCodeStep } from '../VerificationCodeStep/VerificationCodeStep.js';
import { useModalStore } from '../../stores/index.js';
import { BiometricLoginStep } from '../BiometricLoginStep/BiometricLoginStep.js';
import { Setup2FAStep } from '../Setup2FAStep/Setup2FAStep.js';
import { LoginDoneStep } from '../LoginDoneStep/LoginDoneStep.js';
import { EnabledFlow, TOAuthMethod } from '@getpara/web-sdk';
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
import { TelegramOAuthStep } from '../OAuth/TelegramOAuthStep.js';
import { AwaitingPasswordStep } from '../AwaitingPasswordStep/AwaitingPasswordStep.js';
import { IFrameStep } from '../IFrameStep/IFrameStep.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { ExternalWalletVerificationStep } from '../ExternalWalletVerificationStep/ExternalWalletVerificationStep.js';
import { NetworkSpeedBanner } from '@getpara/react-common';

interface BodyProps {
  oAuthMethods?: TOAuthMethod[];
  twoFactorAuthEnabled?: boolean;
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  onClose: () => void;
}

const MIN_HEIGHT = {
  [ModalStep.ADD_FUNDS_AWAITING]: '680px',
};

const PADDING_TOP = {
  [ModalStep.TELEGRAM_OAUTH]: '36px',
};

const PADDING_BOTTOM = {
  [ModalStep.TELEGRAM_OAUTH]: '16px',
};

export const Body = ({ oAuthMethods, twoFactorAuthEnabled, disableEmailLogin, disablePhoneLogin, onClose }: BodyProps) => {
  const currentStep = useModalStore(state => state.step);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const stepDirection = useModalStore(state => state.stepDirection);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const setAccountAddFundTab = useModalStore(state => state.setAccountAddFundTab);
  const embeddedModal = useStore(state => state.modalConfig?.embeddedModal);
  const appName = useStore(state => state.appName);

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
      case ModalStep.EXTERNAL_WALLET_VERIFICATION: {
        return <ExternalWalletVerificationStep />;
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
        return <BiometricCreationStep />;
      }
      case ModalStep.AWAITING_OAUTH: {
        return <AwaitingOAuthStep />;
      }
      case ModalStep.FARCASTER_OAUTH: {
        return <FarcasterOAuthStep />;
      }
      case ModalStep.TELEGRAM_OAUTH: {
        return <TelegramOAuthStep />;
      }
      case ModalStep.ADD_FUNDS_BUY:
      case ModalStep.ADD_FUNDS_RECEIVE:
      case ModalStep.ADD_FUNDS_WITHDRAW: {
        return <AddFunds data-testid="add-funds" />;
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
      default: {
        if (IFrameSteps.includes(currentStep)) {
          return null;
        }
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
            <InnerContainer
              $embeddedModal={!!embeddedModal}
              $step={currentStep}
              $isIFrameStep={IFrameSteps.includes(currentStep)}
            >
              <NetworkSpeedBanner fontSize="12px" iconSize="16px" />
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
                      This Para Modal is configured to run on-ramp services in <b>test mode</b> only, for development
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
        {/* Leaving IFrameStep outside of the animation container to avoid unnecessary rerenders and excessive data loading */}
        <IFrameStep />
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

const InnerContainer = styled.div<{ $embeddedModal: boolean; $step: ModalStep; $isIFrameStep: boolean }>`
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;
  padding: ${({ $embeddedModal, $step, $isIFrameStep }) =>
    $isIFrameStep
      ? '0px'
      : $embeddedModal
        ? '12px 0px 0px'
        : `${PADDING_TOP[$step] ?? '72px'} 72px ${PADDING_BOTTOM[$step] ?? '32px'}`};
  min-height: ${({ $step }) => MIN_HEIGHT[$step] ?? 'auto'};
  height: ${({ $step }) => MIN_HEIGHT[$step] ?? 'auto'};

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: ${({ $embeddedModal, $step, $isIFrameStep }) =>
      $isIFrameStep ? '0px' : $embeddedModal ? '12px 0px 0px' : `${PADDING_TOP[$step] ?? '72px'} 16px 0px`};
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
