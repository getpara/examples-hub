import { CpslButton, CpslText } from '@usecapsule/react-components';
import { Heading, StepContainer, InnerStepContainer, HeroIcon } from '../common.js';

interface TwoFactorDoneStepStep {
  onClose: () => void;
}

export const TwoFactorDoneStep = ({ onClose }: TwoFactorDoneStepStep) => {
  return (
    <StepContainer>
      <HeroIcon icon="checkCircleFilled" />
      <InnerStepContainer>
        <Heading variant="headingXS" weight="semiBold">
          Success
        </Heading>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          Your wallet is now protected by 2FA
        </CpslText>
      </InnerStepContainer>
      <CpslButton fullWidth onClick={onClose}>
        Done
      </CpslButton>
    </StepContainer>
  );
};
