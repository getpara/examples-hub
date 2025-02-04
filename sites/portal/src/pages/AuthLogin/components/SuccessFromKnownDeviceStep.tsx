import { styled } from 'styled-components';
import { InnerContainer } from '../../../components/common';
import { CpslButton, CpslText } from '@getpara/react-components';
import { CenteredText } from '@getpara/react-common';
import { useCloseWindow } from '../../../hooks/useCloseWindow';

interface SuccessFromKnownDeviceStepProps {
  onAddPasskeyClick: () => void;
}

export const SuccessFromKnownDeviceStep = ({ onAddPasskeyClick }: SuccessFromKnownDeviceStepProps) => {
  const closeWindow = useCloseWindow();

  const handleContinueClick = () => {
    closeWindow();
  };

  return (
    <InnerContainer>
      <ContentContainer>
        <CpslText weight="bold" variant="headingS">
          Login Successful
        </CpslText>
        <CenteredText weight="medium" variant="bodyS" color="secondary">
          Add a passkey on this device for faster login in the future.
        </CenteredText>
      </ContentContainer>
      <ContentContainer>
        <CpslButton fullWidth onClick={onAddPasskeyClick} variant="secondary">
          Add Passkey
        </CpslButton>
        <CpslButton fullWidth onClick={handleContinueClick}>
          Continue
        </CpslButton>
      </ContentContainer>
    </InnerContainer>
  );
};

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;
