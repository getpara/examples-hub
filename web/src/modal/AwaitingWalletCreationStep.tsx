import { ModalStep } from './steps';
import {
  Text,
  VStack,
  Spacer,
  Spinner
} from '@chakra-ui/react';
import React from 'react';

export function AwaitingWalletCreationStep({
  currentStep,
}: {
  currentStep: ModalStep;
}) {
  if (currentStep !== ModalStep.AWAITING_WALLET_CREATION && currentStep !== ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN) {
    return null;
  }
  return (
    <VStack justifyContent="center" alignItems="center" flex={1}>
      <Text marginTop='100px' fontSize="22px">
        Creating wallet...
      </Text>
      <Spinner mt="8px" height="60px" width="60px" color="brand.content" />
      <Spacer />
    </VStack>
  );
}
