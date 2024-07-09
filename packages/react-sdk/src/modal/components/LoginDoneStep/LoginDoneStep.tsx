import { AddFundsButton, Heading, HeroNoSpacing } from '../common.js';
import { CpslButton } from '@usecapsule/react-components';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  return (
    <>
      <HeroNoSpacing icon="heroWallet" />
      <Heading style={{ marginBottom: '24px' }}>
        <span>You’re Logged In!</span>
      </Heading>
      <CpslButton fullWidth onClick={onClose}>
        Close
      </CpslButton>
      <AddFundsButton />
    </>
  );
};
