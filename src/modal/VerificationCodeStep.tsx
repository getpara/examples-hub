import { ModalStep } from './steps';
import React, { useState } from 'react';
import { Button, Input, Spacer, Text } from '@chakra-ui/react';
import { Capsule } from '../Capsule';

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
      <Text width={'100%'}>Enter your verification code</Text>
      <Input
        borderColor={'brand.frameColor'}
        textColor={'brand.text'}
        placeholder="verification code"
        onChange={async (e) => {
          setVerificationCode(e.target.value);
        }}
      />
      <Spacer />
      <Button
        colorScheme="teal"
        onClick={async () => {
          setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
          setCurrentStep(ModalStep.BIOMETRIC_CREATION);
        }}
      >
        Submit
      </Button>
    </>
  );
}
