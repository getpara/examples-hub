import { CpslButton, CpslText } from '@getpara/react-components';
import { Heading, StepContainer, InnerStepContainer, HeroIcon } from '../common.js';
import { useThemeStore } from '../../stores/index.js';

interface TwoFactorDoneStepStep {
  onClose: () => void;
}

export const TwoFactorDoneStep = ({ onClose }: TwoFactorDoneStepStep) => {
  const hideWallets = useThemeStore(state => state.hideWallets);

  return (
    <StepContainer>
      <HeroIcon icon="checkCircleFilled" />
      <InnerStepContainer>
        <Heading variant="headingXS" weight="semiBold">
          Success
        </Heading>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          Your {hideWallets ? 'account' : 'wallet'} is now protected by 2FA
        </CpslText>
      </InnerStepContainer>
      <CpslButton fullWidth onClick={onClose}>
        Done
      </CpslButton>
    </StepContainer>
  );
};
