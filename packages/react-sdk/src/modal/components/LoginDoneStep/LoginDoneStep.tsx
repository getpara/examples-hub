import { useEffect, useRef } from 'react';
import { AddFundsButton, Heading, HeroNoSpacing } from '../common.js';
import { useOnClickAddFunds } from '../../hooks/useOnClickAddFunds.js';
import { useModalStore } from '../../stores/index.js';
import { validateOnRampConfig } from '../../utils/validateOnRampConfig.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const autoCloseTimeout = useRef<number>();
  const onRampConfig = useModalStore((state) => state.onRampConfig);

  const isOnRampAvailable = validateOnRampConfig(onRampConfig);

  const onClickAddFunds = useOnClickAddFunds(onRampConfig);

  useEffect(() => {
    if (!isOnRampAvailable)
      autoCloseTimeout.current = window.setTimeout(() => {
        onClose();
      }, 1000);

    return () => clearTimeout(autoCloseTimeout.current);
  }, []);

  return (
    <>
      <HeroNoSpacing icon="heroWallet" />
      <Heading>
        <span>You’re Logged In!</span>
      </Heading>
      {isOnRampAvailable && <AddFundsButton onClick={onClickAddFunds} />}
    </>
  );
};
