import { ModalStep } from './steps';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';

export function AwaitingWalletCreationStep({
  currentStep,
  percentKeygenDone,
}: {
  currentStep: ModalStep;
  percentKeygenDone: number;
}) {
  if (currentStep !== ModalStep.AWAITING_WALLET_CREATION) {
    return null;
  }
  return (
    <>
      <Text fontSize="l" position="absolute">
        Creating Wallet
      </Text>
      <Flex flex={1} justifyContent="center" alignItems="center">
        <CircularProgress
          size="60px"
          thickness="10px"
          color={'brand.content'}
          trackColor={'brand.contentSecondary'}
          value={percentKeygenDone}
        />
      </Flex>
    </>
  );
}
