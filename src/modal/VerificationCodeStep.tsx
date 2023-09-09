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
import { CoreCapsule } from '../CoreCapsule';

export function VerificationCodeStep({
  setWebAuthURLForCreate,
  setCurrentStep,
  currentStep,
  capsule,
}: {
  capsule: Capsule | CoreCapsule;
  setCurrentStep: (newValue: ModalStep) => void;
  currentStep: ModalStep;
  setWebAuthURLForCreate: (newValue: string) => void;
}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const [tooManyAttempts, setTooManyAttempts] = useState(false);
  const [resendStatus, setResendStatus] = useState('Resend Code');
  const [isResendButtonDisabled, setResendButtonDisabled] = useState(false);

  const handleClick = async () => {
    setResendStatus("Code Resent!");
    setResendButtonDisabled(true);
    await capsule.resendVerificationCode();

    setTimeout(() => {
      setResendStatus("Resend Code");
      setResendButtonDisabled(false);
    }, 3000);
  };

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
          errorBorderColor='red.500'
          isInvalid={incorrectCode}
          isDisabled={tooManyAttempts}
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
        {incorrectCode && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">Incorrect Code</Text>}
        {tooManyAttempts && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">Too many incorrect attempts. Please try again in 10 minutes.</Text>}
        <Spacer />
        <Button
          width="100%"
          onClick={async () => {
            if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
              try {
                setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
                setIncorrectCode(false);
                setCurrentStep(ModalStep.BIOMETRIC_CREATION);
              } catch (e) {
                if (e.message.includes('429')) {
                  setIncorrectCode(false);
                  setTooManyAttempts(true);
                } else {
                  setIncorrectCode(true);
                  setTooManyAttempts(false);
                }
              }
            } else {
              setIncorrectCode(true);
            }
          }}
        >
          Continue
        </Button>
        <Button
          variant="link"
          onClick={async () => {
            await handleClick();
          }}
          isDisabled={isResendButtonDisabled || tooManyAttempts}
        >
          <Text fontSize={11}>{resendStatus}</Text>
        </Button>
      </VStack>
    </>
  );
}
