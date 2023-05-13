import { ModalStep } from './steps';
import { Box, Button, Text } from '@chakra-ui/react';
import React from 'react';
import WalletSuccess from './assets/walletSuccess';
import Copy from './assets/copy';

export function LoginDoneStep({ currentStep, onClose }: { currentStep: ModalStep, onClose: () => void }) {
  if (currentStep !== ModalStep.LOGIN_DONE) {
    return null;
  }
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
      </Box>
      <Button w="100%" h="44px" onClick={onClose}>
        Close
      </Button>
    </Box>
  );
}
