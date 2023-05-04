import { ModalStep } from './steps';
import { ModalCloseButton, Text } from '@chakra-ui/react';
import React from 'react';

export function LoginDoneStep({ currentStep }: { currentStep: ModalStep }) {
  if (currentStep !== ModalStep.LOGIN_DONE) {
    return null;
  }
  return (
    <>
      <ModalCloseButton color="brand.text" />
      <Text>You're fully logged in!</Text>
    </>
  );
}
