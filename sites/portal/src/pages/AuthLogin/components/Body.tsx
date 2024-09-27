import { styled } from 'styled-components';
import { AuthLoginStep } from '../../../constants';
import { ModalFooter } from '../../../components/ModalFooter';
import { SelectFlowStep } from './SelectFlowStep';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalSuccess } from '../../../components/ModalSuccess';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { AddDeviceStep } from './AddDeviceStep';
import { SelectWallet } from './SelectWallet';

interface BodyProps {
  addDeviceUrl?: string;
  step: AuthLoginStep;
  isAddingNewDevice: boolean;
  onLoginClick: () => void;
  onAddDeviceClick: () => void;
  sessionLookupId: string;
}

export const Body = ({
  addDeviceUrl,
  step,
  isAddingNewDevice,
  onLoginClick,
  onAddDeviceClick,
  sessionLookupId,
}: BodyProps) => {
  const { partner } = useModalOutletContext();

  const Content = () => {
    switch (step) {
      case AuthLoginStep.SELECT_FLOW: {
        return <SelectFlowStep onLoginClick={onLoginClick} onAddDeviceClick={onAddDeviceClick} />;
      }
      case AuthLoginStep.WAITING: {
        return <ModalLoading heading="Waiting for Passkey..." />;
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
            icon={isAddingNewDevice ? 'heroPasskey' : 'heroWallet'}
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
      <InnerContainer>{Content()}</InnerContainer>
      <ModalFooter />
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

const InnerContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;
