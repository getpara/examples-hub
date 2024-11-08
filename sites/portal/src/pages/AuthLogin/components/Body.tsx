import { styled } from 'styled-components';
import { AuthLoginStep } from '../../../constants';
import { ModalFooter } from '../../../components/ModalFooter';
import { ManualLoginStep } from './ManualLoginStep';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalSuccess } from '../../../components/ModalSuccess';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { AddDeviceStep } from './AddDeviceStep';
import { SelectWallet } from './SelectWallet';
import { EnterPasswordStep } from './EnterPasswordStep';
import { BiometricLocationHint } from '@usecapsule/user-management-client';
import { LoginFailedStep } from './LoginFailedStep';
import { LoginFailedTroubleshootingStep } from './LoginFailedTroubleshootingStep';

interface BodyProps {
  addDeviceUrl?: string;
  step: AuthLoginStep;
  isAddingNewDevice: boolean;
  onLoginClick: () => void;
  onLoginWithPasswordClick: (password: string) => void;
  onLoginFromAnotherDevice: () => Promise<void>;
  setStep: (step: AuthLoginStep) => void;
  sessionLookupId: string;
  biometricLocationHints: BiometricLocationHint[];
  loginWithPasswordError?: string;
}

export const Body = ({
  addDeviceUrl,
  step,
  isAddingNewDevice,
  onLoginClick,
  onLoginWithPasswordClick,
  onLoginFromAnotherDevice,
  setStep,
  sessionLookupId,
  biometricLocationHints,
  loginWithPasswordError,
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
        return <ModalLoading heading="Waiting for Passkey..." />;
      }
      case AuthLoginStep.ENTER_PASSWORD: {
        return <EnterPasswordStep error={loginWithPasswordError} onLoginClick={onLoginWithPasswordClick} />;
      }
      case AuthLoginStep.SELECT_WALLET: {
        return <SelectWallet sessionLookupId={sessionLookupId} />;
      }
      case AuthLoginStep.SUCCESS: {
        return (
          <ModalSuccess
            heading={isAddingNewDevice ? 'Passkey Ready To Be Added' : 'You’re Logged In!'}
            subHeading={
              isAddingNewDevice
                ? 'Return to your other device to register the new Passkey before closing this window.'
                : `If you are not automatically redirected, click here to return to ${partner.displayName}. Please do not close this page.`
            }
          />
        );
      }
      case AuthLoginStep.ADD: {
        return <AddDeviceStep addDeviceUrl={addDeviceUrl} />;
      }
    }
  };

  return (
    <Container>
      <InnerContainer $isTroubleshooting={step === AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING}>{Content()}</InnerContainer>
      <ModalFooter step={step} setStep={setStep} />
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
`;

const InnerContainer = styled.div<{ $isTroubleshooting: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: ${({ $isTroubleshooting }) => ($isTroubleshooting ? 'flex-start' : 'center')};
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0px 24px;
`;
