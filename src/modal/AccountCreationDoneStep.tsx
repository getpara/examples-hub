import { ModalStep } from './steps';
import {
  Box,
  Button,
  Collapse,
  HStack,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Capsule } from '../Capsule';

export function AccountCreationDoneStep({
  currentStep,
  recoveryShare,
  capsule,
  defaultAsset,
  onRampAvailable,
  onClose,
  rampNetworkApiKey
}: {
  currentStep: ModalStep;
  recoveryShare: string;
  capsule: Capsule;
  defaultAsset: string;
  onRampAvailable: boolean;
  onClose: () => void;
  rampNetworkApiKey: string;
}) {
  const [show, setShow] = React.useState(false);

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

  const handleToggle = () => setShow(!show);
  if (currentStep !== ModalStep.ACCOUNT_CREATION_DONE) {
    return null;
  }
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        <ModalCloseButton color="brand.text" />
        <Text marginBottom={2}>
          Your account has been created! Keep your recovery share safe!
        </Text>
        <HStack justifyContent="space-between" width="100%">
          <Button size="sm">Action 1</Button>
          <Button size="sm">Action 2</Button>
          <Button onClick={handleToggle} size="sm">
            {show ? 'Collapse' : 'Expand'}
          </Button>
        </HStack>
        {onRampAvailable ? (
          <Button size="sm" marginTop={6} onClick={addCash}>
            Add cash
          </Button>
        ) : null}
        <Collapse in={show} startingHeight={80}>
          <Text
            borderColor="brand.button"
            marginTop={2}
            borderWidth={2}
            padding={4}
            userSelect="all"
            fontFamily="monospace"
            wordBreak="break-all"
            contentEditable={false}
          >
            {recoveryShare}
          </Text>
        </Collapse>
        {!show && (
          <Box
            bgGradient="linear(transparent 0%, brand.background 100%)"
            position="absolute"
            width={'100%'}
            left={0}
            height={6}
            bottom={12}
          />
        )}
      </Box>
    </>
  );
}
