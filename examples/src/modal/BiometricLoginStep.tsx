import { ModalStep } from './steps';
import { Spacer, Text, useColorModeValue, useTheme } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React from 'react';

export function BiometricLoginStep({
  currentStep,
  webAuthURLForLogin,
}: {
  currentStep: ModalStep;
  webAuthURLForLogin: string;
}) {
  const {
    colors: {
      brand: { text: fgColor, background: bgColor },
    },
  } = useTheme();

  if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
    return null;
  }

  return (
    <>
      <Text marginBottom={8}>
        Scan or click this QR code to login from the same device you used during
        account setup.
      </Text>
      <a href={webAuthURLForLogin} rel="noreferrer" target="_blank">
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          value={webAuthURLForLogin}
        />
      </a>
      <Spacer />
    </>
  );
}
