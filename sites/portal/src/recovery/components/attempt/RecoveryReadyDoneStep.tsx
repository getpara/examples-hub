import { VStack, Spacer, Text, Button } from '@chakra-ui/react';
import WalletSuccess from '../../../assets/walletSuccess';

type RecoveryReadyDoneStepProps = {
  onClose: () => void;
};

const RecoveryReadyDoneStep: React.FC<RecoveryReadyDoneStepProps> = ({ onClose }) => {
  return (
    <VStack flex={1}>
      <Text fontSize="l">Wallet is ready to recover</Text>
      <WalletSuccess />
      <Text fontSize="md" paddingTop="8" align="center">
        Please click the Recover Wallet button after closing this modal to begin the process.
      </Text>
      <Text fontSize="md" align="center" paddingTop="4">
        You can come back to this page at any point within the next 24 hours, or cancel this Recovery Attempt by visiting
        your email.
      </Text>
      <Spacer />
      <Button width="100%" onClick={onClose}>
        Close
      </Button>
    </VStack>
  );
};

export default RecoveryReadyDoneStep;
