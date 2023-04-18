import {
  Flex,
  FormLabel,
  Heading,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import QrCode from 'react-qr-code';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

export const ModalState = {
  Loading: 'loading',
  Success: 'success',
  Failure: 'failure',
} as const;

export type ModalStateType = (typeof ModalState)[keyof typeof ModalState];

const label = {
  [ModalState.Loading]: 'Hold tight...',
  [ModalState.Success]: 'Yay!',
  [ModalState.Failure]: 'Oh no!',
};

const text = {
  [ModalState.Loading]: 'We will soon recover your wallet',
  [ModalState.Success]: 'Your wallet was recovered successfully',
  [ModalState.Failure]: 'Something went wrong!',
};

function FinalModal({
  state,
  onClose,
  isOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  state: ModalStateType;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent backgroundColor={"gray.700"}>
        <ModalHeader>{label[state]}</ModalHeader>
        <Flex
          alignItems="center"
          justifyContent="center"
          marginBottom={12}
          marginTop={6}
        >
          {state === ModalState.Loading && <Spinner size="xl" />}
          {state === ModalState.Success && <CheckCircleIcon w={32} h={32} />}
          {state === ModalState.Failure && <WarningIcon w={32} h={32} />}
        </Flex>
        <Text marginBottom={8} alignSelf="center">
          {' '}
          {text[state]}{' '}
        </Text>
      </ModalContent>
    </Modal>
  );
}

export default FinalModal;
