import { Box, Button, Spacer, Text, VStack } from '@chakra-ui/react';
import WalletSuccess from './assets/walletSuccess';

export function LoginDoneStep({
  onClose,
  appName,
}: {
  onClose: () => void;
  appName: string;
}) {

  return (
    <VStack flex={1}>
      <Spacer />
      <Box position='relative' top='-28px'>
        <Text fontSize="l">Wallet Login Complete!</Text>
        <Box marginTop="18px">
          <WalletSuccess />
        </Box>
      </Box>
      <Spacer />
      <Box position='relative' top='-28px' width='274px'>
        <Button
          onClick={onClose}
          textColor="brand.text" 
          bg="#212327" 
          width='100%'
          _hover={{bg: 'rgba(255, 255, 255, 0.5)'}}
        >
          Continue to {appName}
        </Button>
      </Box>
    </VStack>
  );
}
