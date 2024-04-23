import { useState } from 'react';
import { ModalStep } from '../steps/recoverySteps';
import { STORAGE_PREFIX } from '@usecapsule/web-sdk';

const useCurrentRecoveryStepState = (initialValue: ModalStep) => {
  const [state, setState] = useState(
    (sessionStorage.getItem(
      `${STORAGE_PREFIX}currentRecoveryStep`,
    ) as ModalStep) || initialValue,
  );

  const setCurrentRecoveryStep = (value: ModalStep) => {
    setState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}currentRecoveryStep`, value);
  };

  return [state, setCurrentRecoveryStep] as const;
};

export default useCurrentRecoveryStepState;
