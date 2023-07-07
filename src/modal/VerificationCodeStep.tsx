import { ModalStep } from './steps';
import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Capsule } from '../Capsule';
import Console from './assets/console';
import VerifyCode from './assets/verifyCode';

export function VerificationCodeStep({
  setWebAuthURLForCreate,
  setCurrentStep,
  currentStep,
  capsule,
}: {
  capsule: Capsule;
  setCurrentStep: (newValue: ModalStep) => void;
  currentStep: ModalStep;
  setWebAuthURLForCreate: (newValue: string) => void;
}) {
  const [verificationCode, setVerificationCode] = useState('');
  if (currentStep !== ModalStep.VERIFICATION_CODE) {
    return null;
  }
  return (
    <>
      <VStack flex={1}>
        <Text textColor="brand.content" fontSize="l">
          Verify Email
        </Text>
        <Console />

        <Spacer width="8px" />
        <HStack alignItems="start">
          <Box marginTop="6px">
            <VerifyCode />
          </Box>
          <Box>
            <Text textColor="brand.content" fontSize="m">
              Verify email
            </Text>
            <Text textColor="brand.content" fontSize="s">
              Enter the 6-digit authentication code that was sent to your email
              to verify your signup.
            </Text>
          </Box>
        </HStack>

        <Text
          alignSelf="start"
          fontSize="s"
          textColor="brand.contentSecondary"
          marginBottom="-8px !important" // sorry!
        >
          6 digit code
        </Text>
        <Input
          type="string"
          borderColor="brand.frameColor"
          textColor="brand.text"
          background="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="5px"
          focusBorderColor="brand.text"
          placeholder="Enter code"
          onChange={async (e) => {
            setVerificationCode(e.target.value);
          }}
        />
        <Spacer />
        <Button
          width="100%"
          onClick={async () => {
            setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
            setCurrentStep(ModalStep.BIOMETRIC_CREATION);
          }}
        >
          Continue
        </Button>
        <Button 
          variant="link" 
          onClick={async () => {
            await capsule.resendVerificationCode();
          }
        }>
          <Text fontSize={11}>Resend Code</Text>
        </Button>
      </VStack>
    </>
  );
}
