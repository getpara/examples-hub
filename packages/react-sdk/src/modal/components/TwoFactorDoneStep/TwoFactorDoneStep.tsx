import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import {
  Heading,
  HeroNoSpacing,
  SecondaryText,
  ButtonWithIconContainer,
} from '../common.js';
import styled from 'styled-components';

interface TwoFactorDoneStepStep {
  onClose: () => void;
}

export const TwoFactorDoneStep = ({ onClose }: TwoFactorDoneStepStep) => {
  return (
    <>
      <HeroNoSpacing icon="heroWallet" />
      <Heading>
        <span>Success</span>
      </Heading>
      <SecondaryText>
        Your Two-Factor Authentication has been successfully set up!
      </SecondaryText>
      <CpslButton onClick={onClose}>
        <ButtonWithIconContainer>
          <CheckIcon icon="check" />
          Done
        </ButtonWithIconContainer>
      </CpslButton>
    </>
  );
};

const CheckIcon = styled(CpslIcon)`
  --width: 20px;
  --height: 20px;
`;
