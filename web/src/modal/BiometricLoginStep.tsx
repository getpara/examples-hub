import { ModalStep } from './steps';
import { Box, Icon, Text, useTheme, VStack } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { Capsule } from '../Capsule';
import { upload } from '../core/transmission/transmissionUtils';
import { openPopup } from './utils';
import { CoreCapsule } from '../core/CoreCapsule';
import CustomButton from '../components/CustomButton';

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
        backgroundColor="brand.button"
        borderRadius="12px"
        padding="12px"
        onClick={() => openPopup(shortLoginLink)}
        width='188px'
        height='188px'
      >
        <QRCode
          fgColor='brand.text'
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
        <CustomButton 
          openPopup={openPopup}
          webAuthURL={shortLoginLink}
          text="Use passkey"
        />
      </Box>
    </VStack>
  );
}
