import { ModalStep } from './steps';
import {
  Box,
  Button,
  HStack,
  Spacer,
  Text,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React from 'react';
import { openPopup } from './utils';
import VerifyCode from './assets/verifyCode';
import Identity from './assets/Identity';
import Plus from './assets/plus';

export function BiometricCreationStep({
  currentStep,
  webAuthURLForCreate,
}: {
  currentStep: ModalStep;
  webAuthURLForCreate: string;
}) {
  const {
    colors: {
      brand: { dimmed: bgColor, background: fgColor },
    },
  } = useTheme();

  if (currentStep !== ModalStep.BIOMETRIC_CREATION) {
    return null;
  }
  return (
    <VStack flex={1} alignItems="center">
      <Text fontSize="l">Finish setup</Text>
      <Text textColor="brand.text" fontSize="s" width="90%" textAlign="center">
        Scan or click this QR code to allow for easier login.
      </Text>
      <Spacer />
      <Box
        cursor="pointer"
        backgroundColor="brand.dimmed"
        borderRadius="12px"
        padding="18px"
        onClick={() => openPopup(webAuthURLForCreate)}
      >
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          size={180}
          value={webAuthURLForCreate}
        />
      </Box>
      <Spacer />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <Identity />
        </Box>
        <Box>
          <Text textColor="brand.content" fontSize="m">
            Verify Identity
          </Text>
          <Text textColor="brand.content" fontSize="s">
            Follow the modal prompts that appear to ask you to verify.
          </Text>
        </Box>
      </HStack>
      <Spacer />
      <Button w="100%" onClick={() => openPopup(webAuthURLForCreate)}>
        Continue
      </Button>
    </VStack>
  );
}
