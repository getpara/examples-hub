import React from 'react';
import emptyFunction from '../emptyFunction';
import { ModalStep } from '../steps/attemptSteps';

interface StepContextType {
    currentStep: ModalStep;
    setCurrentStep: (step: ModalStep) => void;
}

const StepContext = React.createContext<StepContextType>({
    currentStep: ModalStep.EMAIL_COLLECTION,
    setCurrentStep: emptyFunction
});

export default StepContext;