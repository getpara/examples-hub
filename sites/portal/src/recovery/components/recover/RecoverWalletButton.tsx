import { Button, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { RecoveryStatus } from '@getpara/web-sdk';
import RecoveryWalletModal from './RecoverWalletModal';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep as RecoveryModalStep } from '../../steps/recoverySteps';
import { ModalStep } from '../../steps/attemptSteps';
import StepContext from '../../contexts/StepContext';
import ParaSmall from '../../../assets/paraSmall';

const RecoverWalletButton: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { setStatus } = useContext(RecoveryAttemptContext);
  const { setCurrentStep } = useContext(StepContext);
  const { currentRecoveryStep, setCurrentRecoveryStep } = useContext(RecoveryStepContext);

  return (
    <Button height={'50px'} backgroundColor={'brand.background'} color={'white'} onClick={() => setModalIsOpen(true)}>
      <RecoveryWalletModal
        onClose={() => {
          if (currentRecoveryStep === RecoveryModalStep.FINISH) {
            setCurrentStep(ModalStep.EMAIL_COLLECTION);
            setCurrentRecoveryStep(RecoveryModalStep.VERIFY_2FA);
            setStatus(RecoveryStatus.FINISHED);
          }
          setModalIsOpen(false);
        }}
        isOpen={modalIsOpen}
      />
      <Text size="18px" marginRight="9px">
        Recover Wallet
      </Text>
      <ParaSmall />
    </Button>
  );
};

export default RecoverWalletButton;
