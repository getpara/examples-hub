import { ModalStep } from './steps';
import { Text, useTheme } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React from 'react';

export function BiometricCreationStep({
  currentStep,
  webAuthURLForCreate,
}: {
  currentStep: ModalStep;
  webAuthURLForCreate: string;
}) {
  const {
    colors: {
      brand: { text: fgColor, background: bgColor },
    },
  } = useTheme();

  if (currentStep !== ModalStep.BIOMETRIC_CREATION) {
    return null;
  }
  return (
    <>
      <Text marginBottom={8}>
        Scan or click this QR code to make logging in easy next time.
      </Text>
      <a href={webAuthURLForCreate} rel="noreferrer" target="_blank">
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          value={webAuthURLForCreate}
        />
      </a>
    </>
  );
}
