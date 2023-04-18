import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Flex,
} from '@chakra-ui/react';

import React, { useEffect, useState } from 'react';
import QrCode from 'react-qr-code';

function SingleInputModal({
  onClose,
  isOpen,
  onAction,
  value,
  onValue,
  action,
  title,
  placeholder,
  label,
}: {
  onClose: () => void;
  isOpen: boolean;
  onAction: () => void;
  value: string;
  onValue: (newValue: string) => void;
  title: string;
  action: string;
  label: string;
  placeholder: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent  backgroundColor={"gray.700"}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>{label}</FormLabel>
            <InputGroup>
              <Input
                value={value || ''}
                onChange={(event) => onValue(event.target.value)}
                placeholder={placeholder}
              />
            </InputGroup>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              onClose();
              onAction();
            }}
          >
            {action}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SingleInputModal;
