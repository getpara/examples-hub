import { ModalStep } from './steps';
import { Box, HStack, Spacer, Text, useTheme, VStack } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import { Capsule } from '../Capsule';
import { upload } from '../transmission/transmissionUtils';
import { openPopup } from './utils';
import Identity from './assets/Identity';

const SHORTENING_AVAILABLE = true;

export function BiometricLoginStep({
  currentStep,
  webAuthURLForLogin,
  capsule,
}: {
  currentStep: ModalStep;
  webAuthURLForLogin: string;
  capsule: Capsule;
}) {
  const {
    colors: {
      brand: { dimmed: bgColor, background: fgColor },
    },
  } = useTheme();

  const [shortLoginLink, setShortLoginLink] = useState<string>(webAuthURLForLogin);

  useEffect(() => {
    if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
      setShortLoginLink(null);
    }
    async function shortenUrl() {
      const url = await upload(webAuthURLForLogin, capsule);
      // @ts-ignore
      setShortLoginLink(capsule.getShortUrl(url));
    }
    if (SHORTENING_AVAILABLE) {
      shortenUrl();
    } else {
      setShortLoginLink(webAuthURLForLogin);
    }
  }, [webAuthURLForLogin]);

  if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
    return null;
  }

  return (
    <VStack flex={1} alignItems="center">
      <Text fontSize="l">Finish login</Text>
      <Text textColor="brand.text" fontSize="s" width="90%" textAlign="center">
        Scan or click this QR code to login from the same device you used.
      </Text>
      <Spacer />
      <Box
        cursor="pointer"
        backgroundColor="brand.dimmed"
        borderRadius="12px"
        padding="12px"
        onClick={() => openPopup(shortLoginLink)}
      >
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          size={200}
          value={shortLoginLink}
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
    </VStack>
  );
}
