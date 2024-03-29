import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import {
  Heading,
  HeroNoSpacing,
  SecondaryText,
  ButtonWithIconContainer,
} from '../common';

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
        Your 2-Factor Authentication has been successfully set up!
      </SecondaryText>
      <CpslButton onClick={onClose}>
        <ButtonWithIconContainer>
          <CpslIcon icon="check" />
          Done
        </ButtonWithIconContainer>
      </CpslButton>
    </>
  );
};
