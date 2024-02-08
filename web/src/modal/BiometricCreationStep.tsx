import { ModalStep } from './steps';
import {
  Box,
  Icon,
  Text,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import React from 'react';
import { openPopup } from './utils';
import './css/modal.css';
import CustomButton from '../components/CustomButton';

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
      <Text position='relative' top='-4px' fontSize="22px">Finish setup</Text>
      <Box
        cursor="pointer"
        backgroundColor="brand.dimmed"
        borderRadius="12px"
        padding="12px"
        onClick={() => openPopup(webAuthURLForCreate)}
        width='188px'
        height='188px'
      >
        <QRCode
          fgColor={fgColor}
          bgColor={bgColor}
          size={165}
          value={webAuthURLForCreate}
        />
      </Box>
      <Box width="274px">
        <Text
          marginTop='20px'
          fontSize='20px'
          textAlign='center'
        >
          Click or scan this QR Code for easier login. 
          Follow the prompts asking you to verify.
        </Text>
        <CustomButton 
          openPopup={openPopup}
          webAuthURL={webAuthURLForCreate}
          text="Set up passkey"
        />
      </Box>
    </VStack>
  );
}
