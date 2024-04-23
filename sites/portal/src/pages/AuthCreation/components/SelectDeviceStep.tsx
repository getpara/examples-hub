import styled from 'styled-components';
import {
  Heading,
  Subheading,
  StyledStrong,
  ButtonIcon,
} from '../../../components/common';
import { CpslButton } from '@usecapsule/react-components';

interface SelectDeviceStepProps {
  onAddThisDeviceClick: () => void;
}

export const SelectDeviceStep = ({
  onAddThisDeviceClick,
}: SelectDeviceStepProps) => {
  return (
    <>
      <StyledHeading>
        <span>Create Passkey</span>
      </StyledHeading>
      <Subheading>
        <span>
          Your Passkey will allow you to <StyledStrong>safely</StyledStrong>{' '}
          reuse this wallet across the web.
        </span>
      </Subheading>
      <ButtonContainer>
        <CpslButton onClick={onAddThisDeviceClick}>
          Add Passkey On This Device
          <ButtonIcon slot="end" icon="key" />
        </CpslButton>
      </ButtonContainer>
    </>
  );
};

const StyledHeading = styled(Heading)`
  margin-top: 32px;
  padding-top: 8px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  padding-top: 8px;
  gap: 8px;
  width: 314px;
`;
