import { ModalStep } from './steps';
import { Box, Button, Text } from '@chakra-ui/react';
import WalletSuccess from './assets/walletSuccess';
import { Capsule } from '../Capsule';
import useCheck2FAStatus from '../utils/useCheck2FAStatus';
import { is2FAEnabled } from '../definitions';

export function LoginDoneStep({
  onClose,
  setCurrentStep,
  capsule,
}: {
  onClose: () => void;
  setCurrentStep: (newValue: ModalStep) => void;
  capsule: Capsule;
}) {

  const is2FASetup = useCheck2FAStatus(capsule);
  return (
    <Box
      flexDirection="column"
      display="flex"
      justifyContent="space-between"
      flex={1}
      alignItems="space-between"
    >
      <Box display="flex" flexDirection="column" flex={1} alignItems="center">
        <Text fontSize="l">Wallet logged in!</Text>
        <WalletSuccess />
        <Text textAlign="center" fontSize="l" marginTop="22px">
          Success!
        </Text>
        <Text textAlign="center" marginTop="4px" w="90%" fontSize="s">
          Your wallet has been successfully logged in!
        </Text>
        {!is2FASetup && is2FAEnabled && (
          <Text
            textAlign="center"
            marginTop="20px"
            w="90%"
            as="b"
            fontSize="s"
            _hover={{ textDecoration: 'underline' }}
            cursor="pointer"
            onClick={() => setCurrentStep(ModalStep.SETUP_2FA)}
          >
            Optional: Setup 2FA
          </Text>
        )}
      </Box>
      <Button w="100%" h="44px" onClick={onClose}>
        Close
      </Button>
    </Box>
  );
}
