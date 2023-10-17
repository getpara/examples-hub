import { ModalStep } from './steps';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Progress,
  Text,
  VStack,
  Spacer
} from '@chakra-ui/react';
import React from 'react';

export function AwaitingWalletCreationStep({
  currentStep,
  percentKeygenDone,
}: {
  currentStep: ModalStep;
  percentKeygenDone: number;
}) {
  if (currentStep !== ModalStep.AWAITING_WALLET_CREATION && currentStep !== ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN) {
    return null;
  }
  return (
    <VStack justifyContent="center" alignItems="center" flex={1}>
      <Text marginTop='100px' fontSize="22px">
        Creating wallet...
      </Text>
      <CircularProgress
        top='8px'
        size="60px"
        thickness="10px"
        color={'brand.content'}
        trackColor={'brand.contentSecondary'}
        value={percentKeygenDone}
      />
      <Spacer />
    </VStack>
  );
}
