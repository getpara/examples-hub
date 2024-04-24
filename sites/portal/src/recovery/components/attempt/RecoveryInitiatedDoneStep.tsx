import { VStack, Spacer, Text, Button } from '@chakra-ui/react';
import WalletSuccess from '../../../assets/walletSuccess';

type RecoveryInitiatedDoneStepProps = {
  onClose: () => void;
};

const RecoveryInitiatedDoneStep: React.FC<RecoveryInitiatedDoneStepProps> = ({ onClose }) => {
  return (
    <VStack flex={1}>
      <Text fontSize="l">Recovery Attempt Initiated</Text>
      <WalletSuccess />
      <Text fontSize="md" paddingTop="8" align="center">
        You will now need to wait for <Text as="b">48 hours</Text> until your wallet can be recovered.
      </Text>
      <Text fontSize="md" align="center" paddingTop="4">
        You can come back to this page and check the status at any point, or cancel this Recovery Attempt by visiting your
        email.
      </Text>
      <Spacer />
      <Button width="100%" onClick={onClose}>
        Close
      </Button>
    </VStack>
  );
};

export default RecoveryInitiatedDoneStep;
