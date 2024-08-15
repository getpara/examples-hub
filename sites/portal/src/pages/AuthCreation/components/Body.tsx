import { styled } from 'styled-components';
import { AuthCreationStep } from '../../../constants';
import { SelectDeviceStep } from './SelectDeviceStep';
import { ModalFooter } from '../../../components/ModalFooter';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalSuccess } from '../../../components/ModalSuccess';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';

interface BodyProps {
  step: AuthCreationStep;
  isForNewDevice: boolean;
  userId: string | undefined;
  onAddThisDeviceClick: () => void;
}

export const Body = ({ step, isForNewDevice, onAddThisDeviceClick }: BodyProps) => {
  const { partner } = useModalOutletContext();

  const Content = () => {
    switch (step) {
      case AuthCreationStep.SELECT_DEVICE: {
        return <SelectDeviceStep onAddThisDeviceClick={onAddThisDeviceClick} />;
      }
      case AuthCreationStep.CREATING: {
        return <ModalLoading heading="Creating Passkey..." />;
      }
      case AuthCreationStep.SUCCESS: {
        return (
          <ModalSuccess
            heading="Passkey Registered!"
            subHeading={`You can now close this window and return to ${partner.displayName}.`}
            icon={isForNewDevice ? 'heroPasskey' : 'heroWallet'}
          />
        );
      }
    }
  };

  return (
    <Container slot="body">
      <InnerContainer>{Content()}</InnerContainer>
      <ModalFooter />
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  padding-top: 8px;
  height: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
`;

const InnerContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
`;
