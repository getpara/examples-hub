import React from 'react';
import emptyFunction from '../emptyFunction';
import { ModalStep as ModalRecoveryStep } from '../steps/recoverySteps';

interface RecoveryStepContextType {
    currentRecoveryStep: ModalRecoveryStep;
    setCurrentRecoveryStep: (recoveryStep: ModalRecoveryStep) => void;
}

const RecoveryStepContext = React.createContext<RecoveryStepContextType>({
    currentRecoveryStep: ModalRecoveryStep.VERIFY_2FA,
    setCurrentRecoveryStep: emptyFunction
});

export default RecoveryStepContext;