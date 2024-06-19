import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { Heading, HeroNoSpacing, SecondaryText, ButtonWithIconContainer, AddFundsButton } from '../common.js';
import { styled } from 'styled-components';
import { useOnClickAddFunds } from '../../hooks/useOnClickAddFunds.js';
import { useModalStore } from '../../stores/index.js';
import { validateOnRampConfig } from '../../utils/validateOnRampConfig.js';

interface TwoFactorDoneStepStep {
  onClose: () => void;
}

export const TwoFactorDoneStep = ({ onClose }: TwoFactorDoneStepStep) => {
  const onRampConfig = useModalStore((state) => state.onRampConfig);
  const onClickAddFunds = useOnClickAddFunds(onRampConfig);
  const isOnRampAvailable = validateOnRampConfig(onRampConfig);

  return (
    <>
      <HeroNoSpacing icon="heroWallet" />
      <Heading>
        <span>Success</span>
      </Heading>
      <SecondaryText>Your Two-Factor Authentication has been successfully set up!</SecondaryText>
      <CpslButton fullWidth onClick={onClose}>
        <ButtonWithIconContainer>
          <CheckIcon icon="check" />
          Done
        </ButtonWithIconContainer>
      </CpslButton>
      {isOnRampAvailable && <AddFundsButton onClick={onClickAddFunds} />}
    </>
  );
};

const CheckIcon = styled(CpslIcon)`
  --width: 20px;
  --height: 20px;
`;
