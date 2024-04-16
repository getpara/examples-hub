import { useEffect, useRef } from 'react';
import { Heading, HeroNoSpacing } from '../common.js';

interface LoginDoneStep {
  onClose: () => void;
}

export const LoginDoneStep = ({ onClose }: LoginDoneStep) => {
  const autoCloseTimeout = useRef<number>();

  useEffect(() => {
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
    </>
  );
};
