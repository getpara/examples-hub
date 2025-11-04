import { styled } from 'styled-components';
import { AuthCreationStep } from '../../../constants';
import { ManualCreationStep } from './ManualCreationStep';
import { ModalFooter } from '../../../components/ModalFooter';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalSuccess } from '../../../components/ModalSuccess';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { isIFramed } from '../../../utils/isIFramed';

interface BodyProps {
  step: AuthCreationStep;
  userId: string | undefined;
  onCreateClick: () => void;
}

export const Body = ({ step, onCreateClick }: BodyProps) => {
  const { partner } = useModalOutletContext();

  const Content = () => {
    switch (step) {
      case AuthCreationStep.MANUAL_CREATION: {
        return <ManualCreationStep onCreateClick={onCreateClick} />;
      }
      case AuthCreationStep.CREATING: {
        return <ModalLoading heading="Creating Passkey..." />;
      }
      case AuthCreationStep.SUCCESS: {
        return (
          <ModalSuccess
            heading="Passkey Registered!"
            subHeading={`You can now close this window and return to ${partner.displayName}.`}
          />
        );
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
  padding-top: 8px;
  height: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;

  max-height: calc(100% - var(--card-padding-top));
`;

const InnerContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  ${!isIFramed && 'padding: 0px 24px'}
  overflow: auto;
`;
