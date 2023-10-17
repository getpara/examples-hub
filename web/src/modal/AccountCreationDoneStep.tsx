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
import { Capsule } from '../Capsule';
import { CoreCapsule } from '../core/CoreCapsule';

// const recoveryShare = `{"walletId":"79f5e30c-64bd-44b4-8c9e-b9a0b1e604bf","keyshare":"{\"WalletId\":\"79f5e30c-64bd-44b4-8c9e-b9a0b1e604bf\",\"Id\":\"CAPSULE\",\"Ids\":[\"USER\",\"CAPSULE\"],\"Threshold\":1,\"Signers\":[\"USER\",\"CAPSULE\"],\"Config\":\"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\"}","address":"","backupDecryptionKey":"856f3c531e1c6d54d1a3d778f5985bc91c0c706c7e1d49be4bc1ec02fe69802d"}`;


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
  capsule: Capsule | CoreCapsule;
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
