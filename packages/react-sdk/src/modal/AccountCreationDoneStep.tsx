import { ModalStep } from './steps';
import {
  Text,
  VStack,
  Button,
  Spacer,
  Box
} from '@chakra-ui/react';
import React from 'react';
import WalletSuccess from './assets/walletSuccess';
import { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import CapsuleWeb from '@usecapsule/web-sdk';

export function AccountCreationDoneStep({
  currentStep,
  appName,
  onClose,
  capsule,
  rampNetworkApiKey,
  defaultAsset,
  onRampAvailable,
}: {
  currentStep: ModalStep;
  appName: string;
  onClose: () => void;
  capsule: CapsuleWeb;
  rampNetworkApiKey: string;
  defaultAsset: string;
  onRampAvailable: boolean;
}) {

  const addCash = useCallback(() => {
    onClose();
    new RampInstantSDK({
      hostAppName: 'Your App',
      defaultAsset: defaultAsset,
      hostLogoUrl: 'https://app.sandbox.usecapsule.com/wordmark_black.svg',
      hostApiKey: rampNetworkApiKey,
      userAddress: Object.values(capsule.getWallets())[0].address,
      userEmailAddress: capsule.getEmail(),
      url: 'https://app.demo.ramp.network',
      enabledFlows: ['ONRAMP'],
    }).show();
  }, [defaultAsset, capsule, onClose, rampNetworkApiKey]);

  if (currentStep !== ModalStep.ACCOUNT_CREATION_DONE) {
    return null;
  }
  return (
    <VStack flex={1}>
      <Spacer />
      <Box position='relative' top='-28px'>
        <Text fontSize="l">Wallet Setup Complete!</Text>
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
      {onRampAvailable ? (
        <Button w="100%" h="38px" size="sm" marginTop={6} onClick={addCash}>
          Add cash
        </Button>
      ) : null}
    </VStack>
  );
}
