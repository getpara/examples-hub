import { useCallback } from 'react';
import { useModalStore } from '../stores/index.js';
import { ModalStep } from '../utils/steps.js';

export const useBuyCryptoClick = () => {
  const setStep = useModalStore(state => state.setStep);
  const onRampConfig = useModalStore(state => state.onRampConfig);

  const onClick = useCallback(() => {
    setStep(ModalStep.ADD_FUNDS);
  }, [onRampConfig]);

  return onClick;
};
