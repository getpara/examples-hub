import { ModalStep } from './steps';
import { Box, Icon, Text, useTheme, VStack, Button } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import { Capsule } from '../Capsule';
import { upload } from '../transmission/transmissionUtils';
import { openPopup } from './utils';
import { CoreCapsule } from '../CoreCapsule';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const SHORTENING_AVAILABLE = true;

export function BiometricLoginStep({
  currentStep,
  webAuthURLForLogin,
  capsule,
}: {
  currentStep: ModalStep;
  webAuthURLForLogin: string;
  capsule: Capsule | CoreCapsule;
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
    if (!webAuthURLForLogin) {
      return;
    }

    async function shortenUrl() {
      const url = await upload(webAuthURLForLogin, capsule.ctx.capsuleClient);
      // @ts-ignore
      setShortLoginLink(capsule.getShortUrl(url));
    }
    if (SHORTENING_AVAILABLE) {
      shortenUrl();
    } else {
      setShortLoginLink(webAuthURLForLogin);
    }
  }, [webAuthURLForLogin]);

  if (currentStep !== ModalStep.BIOMETRIC_LOGIN || !shortLoginLink) {
    return null;
  }

  return (
    <VStack flex={1} alignItems="center">
      <Text position='relative' top='-4px' fontSize="22px">Finish login</Text>
      <Box
        cursor="pointer"
        backgroundColor="brand.dimmed"
        borderRadius="12px"
        padding="12px"
        onClick={() => openPopup(shortLoginLink)}
        width='188px'
        height='188px'
      >
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          size={165}
          value={shortLoginLink}
        />
      </Box>
      <Box width="274px">
        <Text
          marginTop='20px'
          fontSize='20px'
          textAlign='center'
        >
          Click or scan this QR Code to login from the same device you used.
        </Text>
        <Button marginTop='68px' w="100%" onClick={() => openPopup(shortLoginLink)}>
          Use passkey <Icon as={ExternalLinkIcon} marginLeft="2" />
        </Button>
      </Box>
    </VStack>
  );
}
