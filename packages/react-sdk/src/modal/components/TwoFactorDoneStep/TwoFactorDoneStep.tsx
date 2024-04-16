import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import {
  Heading,
  HeroNoSpacing,
  SecondaryText,
  ButtonWithIconContainer,
} from '../common.js';

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
          <CpslIcon icon="check" />
          Done
        </ButtonWithIconContainer>
      </CpslButton>
    </>
  );
};
