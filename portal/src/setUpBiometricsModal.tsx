import {
  Flex,
  FormLabel,
  Heading,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import QrCode from 'react-qr-code';

function SetUpBiometricsModal({
  onClose,
  url,
  isOpen,
}: {
  onClose: () => void;
  url: string;
  isOpen: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent backgroundColor={"gray.700"}>
        <ModalHeader>Set up biometrics</ModalHeader>
        <Flex
          alignItems="center"
          justifyContent="center"
          marginBottom={12}
          marginTop={6}
        >
          <QrCode
            value={url}
            size={320}
            bgColor="#FFFFFF"
            fgColor="#2D3748"
            cursor="pointer"
            onClick={() => {
              window.open(url, '_blank');
            }}
          />
        </Flex>
        <Text marginBottom={8} alignSelf="center">
          {' '}
          Scan the code or press{' '}
        </Text>
      </ModalContent>
    </Modal>
  );
}

export default SetUpBiometricsModal;
