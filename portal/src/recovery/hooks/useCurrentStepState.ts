import { useState } from 'react';
import { ModalStep } from '../steps/attemptSteps';
import { STORAGE_PREFIX } from '../../library/modal/utils';

const useCurrentStepState = (initialValue: ModalStep) => {
    const [state, setState] = useState(
        sessionStorage.getItem(`${STORAGE_PREFIX}currentStep`) as ModalStep || initialValue
    );

    const setCurrentStep = (value: ModalStep) => {
        setState(value);
        sessionStorage.setItem(`${STORAGE_PREFIX}currentStep`, value);
    };

    return [state, setCurrentStep] as const;
};

export default useCurrentStepState