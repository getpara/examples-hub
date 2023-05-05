import { ModalStep } from './steps';
import { getMailtoLink } from '../utils/emailUtils'
import {
  Box,
  Button,
  Collapse,
  HStack,
  ModalCloseButton,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import React, { useEffect, useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Capsule } from '../Capsule';

export function AccountCreationDoneStep({
  currentStep,
  recoveryShare,
  email,
  capsule,
  defaultAsset,
  onRampAvailable,
  onClose,
  rampNetworkApiKey
}: {
  currentStep: ModalStep;
  recoveryShare: string;
  email: string;
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
  const { onCopy, setValue, hasCopied } = useClipboard('placeholder');
  useEffect(() => {
    setValue(recoveryShare);
  })

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryShare], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "recovery.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  if (currentStep !== ModalStep.ACCOUNT_CREATION_DONE) {
    return null;
  }
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        <ModalCloseButton color="brand.text" />
        <Text marginBottom={2}>
          Your account has been created! Keep your recovery share safe!
          <Button onClick={handleToggle} variant='link' ml={3}>
            {show ? 'Hide' : 'Show'}
          </Button>
        </Text>
        <HStack justifyContent="space-between" width="100%">
          <Button onClick={onCopy} size="sm">{hasCopied ? "Share Copied!" : "Copy" }</Button>
          <Button onClick={handleDownload} size="sm">Download</Button>
          <Button size="sm"><a href={getMailtoLink(email, recoveryShare)}>Email</a></Button>
        {onRampAvailable ? (
          <Button size="sm" marginTop={6} onClick={addCash}>
            Add cash
          </Button>
        ) : null}
        </HStack>
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
