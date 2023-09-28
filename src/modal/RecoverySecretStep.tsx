import { ModalStep } from './steps';
import {
  Box,
  Button,
  Input,
  Menu,
  MenuItem,
  MenuButton,
  Text,
  VStack,
  useClipboard,
  MenuList,
  Flex,
  Link,
} from '@chakra-ui/react';
import React from 'react';
import './css/modal.css'
import { CopyIcon, ChevronDownIcon, EmailIcon, DownloadIcon, CheckIcon } from '@chakra-ui/icons';
import { lighten } from 'polished'
import { getMailtoLink } from '../utils/emailUtils'

export function RecoverySecretStep({
  currentStep,
  recoveryShare,
  email,
  setCurrentStep
}: {
  currentStep: ModalStep;
  recoveryShare: string;
  email: string;
  setCurrentStep: (newValue: ModalStep) => void;
}) {

  const LIGHT_GRAY = '#212327';
  const HOVER_COLOR = '#f1fff1';
  const backupDecryptionKey = JSON.parse(recoveryShare || '{}').backupDecryptionKey;

  const { onCopy, hasCopied } = useClipboard(backupDecryptionKey);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([backupDecryptionKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  if (currentStep !== ModalStep.SECRET) {
    return null;
  }

  return (
    <VStack flex={1}>
      <Box style={{ marginTop: 36, width: '324px' }} display="flex" flexDirection="column" alignItems="center">
        <Text textColor="brand.text" fontSize="22px">Now let's save your</Text>
        <Text textColor="brand.text" fontSize="22px" fontWeight="bold"><b>recovery secret</b></Text>
      </Box>
      <Box style={{ width: '274px', marginTop: '20px' }}>
        <Text fontWeight={500} lineHeight='18px' fontSize='16px' textAlign='center'>
          You'll need this if you lose your
          device. Copy it and save it
          somewhere safe.
        </Text>
      </Box>
      <Box width='274px'>
        <Text
          alignSelf="start"
          fontSize="12px"
          fontWeight={500}
          lineHeight='16px'
          textColor="#838587"
          marginTop="28px"
        >
          Recovery secret
        </Text>
        <Box position="relative" width="fit-content" marginTop='4px'>
          <Input 
            textColor="brand.text"
            value={backupDecryptionKey} 
            borderColor='brand.frameColor'
            border="1px solid rgba(255, 255, 255, 0.1)"
            background="rgba(255, 255, 255, 0.05)"
            paddingRight="115px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            readOnly
          />
          <Button 
            position="absolute"
            right="6px"
            top="50%"
            transform="translateY(-50%)" 
            onClick={onCopy} 
            leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />} 
            bg={LIGHT_GRAY} 
            _hover={{ bg: HOVER_COLOR, textColor: '#000000' }}
            textColor='brand.text'
            height="75%" 
          >
            {hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
        <Menu>
          {/* @ts-ignore */}
          <MenuButton 
            textColor="brand.text"
            bg={LIGHT_GRAY} 
            as={Button} 
            rightIcon={<ChevronDownIcon />}
            width='274px'
            marginTop='12px'
            _hover={{ bg: HOVER_COLOR, textColor: 'black' }}
            _expanded={{ bg: LIGHT_GRAY, textColor: 'brand.text'}}
          >
            More backup options
          </MenuButton>
          {/* @ts-ignore */}
          <MenuList 
            textColor="brand.text"
            bg={LIGHT_GRAY} 
            width='274px'
            border='none'
          >
            <Link href={getMailtoLink(email, backupDecryptionKey)} isExternal>
              <MenuItem 
                _focus={{ bg: lighten(0.05, LIGHT_GRAY) }}
                justifyContent="center"
              >
                <Flex alignItems="center">
                  <EmailIcon mr={2} />
                  Email
                </Flex>
              </MenuItem>
            </Link>
            {/* @ts-ignore */}
            <MenuItem 
              _focus={{ bg: lighten(0.05, LIGHT_GRAY) }}
              justifyContent="center"
              onClick={handleDownload}
            >
              <Flex alignItems="center">
                <DownloadIcon mr={2} />
                Download
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
        <Text marginTop='16px' lineHeight='18px' fontSize='14px'>
          Learn how to use your recovery secret on {' '}
          {/* @ts-ignore */}
          <Link 
            isExternal 
            href="https://www.usecapsule.com" 
            textDecoration="underline"
          >
            usecapsule.com
          </Link>
          .
        </Text>
        <Button onClick={() => setCurrentStep(ModalStep.SETUP_2FA)} marginTop='44px' width='100%'>
          <Text 
            fontWeight={500}
            lineHeight='28px'
            fontSize='16px'
            color="black"
          >
            I've saved my recovery secret
          </Text>
        </Button>
      </Box>
    </VStack>
  );
}
