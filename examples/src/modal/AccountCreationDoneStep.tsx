import { ModalStep } from './steps';
import {
  Box,
  Button,
  Collapse,
  HStack,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import React from 'react';

export function AccountCreationDoneStep({
  currentStep,
  onClose,
  recoveryShare,
}: {
  currentStep: ModalStep;
  onClose: () => void;
  recoveryShare: string;
}) {
  const [show, setShow] = React.useState(false);

  const handleToggle = () => setShow(!show);
  if (currentStep !== ModalStep.ACCOUNT_CREATION_DONE) {
    return null;
  }
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        <ModalCloseButton color="brand.text" />
        <Text marginBottom={2}>
          Your account has been created! Keep your recovery share safe!
        </Text>
        <HStack justifyContent="space-between" width="100%">
          <Button size="sm">Action 1</Button>
          <Button size="sm">Action 2</Button>
          <Button onClick={handleToggle} size="sm">
            {show ? 'Collapse' : 'Expand'}
          </Button>
        </HStack>
        <Collapse in={show} startingHeight={80}>
          <Text
            borderColor="brand.button"
            marginTop={2}
            borderWidth={2}
            padding={4}
            userSelect="all"
            fontFamily="monospace"
            wordBreak="break-all"
            contentEditable={false}
          >
            {recoveryShare}
          </Text>
        </Collapse>
        {!show && (
          <Box
            bgGradient="linear(transparent 0%, brand.background 100%)"
            position="absolute"
            width={'100%'}
            left={0}
            height={6}
            bottom={12}
          />
        )}
      </Box>
    </>
  );
}
