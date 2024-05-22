import { VStack, Spacer, Text, Button } from '@chakra-ui/react';
import WalletSuccess from '../../../assets/walletSuccess';

type RecoveryReadyStepProps = {
  onClose: () => void;
};

const RecoveryReadyStep: React.FC<RecoveryReadyStepProps> = ({ onClose }) => {
  return (
    <VStack flex={1}>
      <Text fontSize="l">Recovery Ready</Text>
      <WalletSuccess />
      <Text fontSize="md" paddingTop="8" align="center">
        You are ready to recover your wallet now! You have exactly 24 hours to execute this recovery
      </Text>
      <Text fontSize="md" align="center" paddingTop="4">
        You can come back to this page and recover at any point within the 24 hour period, or cancel this Recovery Attempt by
        clicking the button at the bottom of the page.
      </Text>
      <Spacer />
      <Button width="100%" onClick={onClose}>
        Close
      </Button>
    </VStack>
  );
};

export default RecoveryReadyStep;
