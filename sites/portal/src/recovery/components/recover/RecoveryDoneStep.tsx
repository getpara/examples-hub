import { VStack, Spacer, Text, Button } from '@chakra-ui/react';
import { useContext } from 'react';
import { RecoveryStatus } from '@usecapsule/web-sdk';
import { ModalStep } from '../../steps/attemptSteps';
import { ModalStep as RecoveryModalStep } from '../../steps/recoverySteps';
import StepContext from '../../contexts/StepContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import WalletSuccess from '../../../assets/walletSuccess';

type RecoveryDoneStepProps = {
  onClose: () => void;
};

const RecoveryDoneStep: React.FC<RecoveryDoneStepProps> = ({ onClose }) => {
  const { setCurrentStep } = useContext(StepContext);
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { setStatus } = useContext(RecoveryAttemptContext);

  return (
    <VStack flex={1}>
      <Text fontSize="l">Recovery Succeeded</Text>
      <WalletSuccess />
      <Text fontSize="md" paddingTop="8" align="center">
        Success!
      </Text>
      <Text fontSize="md" align="center" paddingTop="4">
        Your wallet has been successfully restored.
      </Text>
      <Spacer />
      <Button
        width="100%"
        onClick={async () => {
          setCurrentStep(ModalStep.EMAIL_COLLECTION);
          setCurrentRecoveryStep(RecoveryModalStep.VERIFY_2FA);
          setStatus(RecoveryStatus.FINISHED);
          onClose();
        }}
      >
        Close
      </Button>
    </VStack>
  );
};

export default RecoveryDoneStep;
