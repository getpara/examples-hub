import { ModalStep } from './steps';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Progress,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import 'react-circular-progressbar/dist/styles.css';

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
      <Text>
        Almost there! Just a little bit longer until wallet creation is done.
      </Text>
      <Box width="100%" justifyContent="center" display="flex">
        <CircularProgress
          size="100px"
          thickness="10px"
          color={'brand.button'}
          trackColor={'brand.backgroundLight'}
          value={percentKeygenDone}
        >
          <CircularProgressLabel fontSize="md" color="brand.text">
            {percentKeygenDone}%
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
    </>
  );
}
