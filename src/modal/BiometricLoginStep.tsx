import { ModalStep } from './steps';
import { Spacer, Text, useTheme } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import { Capsule } from '../Capsule';
import { upload } from '../transmission/transmissionUtils';

const SHORTENING_AVAILABLE = false;

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
      brand: { text: fgColor, background: bgColor },
    },
  } = useTheme();

  const [shortLoginLink, setShortLoginLink] = useState<string>();

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
    <>
      <Text marginBottom={8}>
        Scan or click this QR code to login from the same device you used during
        account setup.
      </Text>
      <a href={shortLoginLink} rel="noreferrer" target="_blank">
        <QRCode fgColor={fgColor} bgColor={bgColor} value={shortLoginLink} />
      </a>
      <Spacer />
    </>
  );
}
