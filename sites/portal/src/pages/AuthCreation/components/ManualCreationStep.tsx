import { styled } from 'styled-components';
import { FlexStartInnerContainer } from '../../../components/common';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { CenteredText } from '@usecapsule/react-common';

interface ManualCreationStepProps {
  onCreateClick: () => void;
}

export const ManualCreationStep = ({ onCreateClick }: ManualCreationStepProps) => {
  return (
    <FlexStartInnerContainer>
      <HeadingContainer>
        <CpslText weight="bold" variant="headingS">
          Create Passkey
        </CpslText>
        <CenteredText weight="medium" variant="bodyS" color="secondary">
          Your Passkey will allow you to safely reuse this wallet across the web.
        </CenteredText>
      </HeadingContainer>
      <CpslButton fullWidth onClick={onCreateClick}>
        Create
      </CpslButton>
    </FlexStartInnerContainer>
  );
};

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;
