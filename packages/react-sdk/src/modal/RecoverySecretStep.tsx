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
import './css/modal.css';
import { lighten } from 'polished';
import { getMailtoLink } from '../utils/emailUtils';

export function RecoverySecretStep({
  currentStep,
  recoveryShare,
  email,
  setCurrentStep,
  twoFactorAuthEnabled
}: {
  currentStep: ModalStep;
  recoveryShare: string;
  email: string;
  setCurrentStep: (newValue: ModalStep) => void;
  twoFactorAuthEnabled?: boolean;
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
            bg={LIGHT_GRAY} 
            _hover={{ bg: HOVER_COLOR, textColor: '#000000' }}
            textColor='brand.text'
            height="75%"
            zIndex={10}
          >
            <div style={{ marginRight: '8px' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            {hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
        <Menu>
          { /* @ts-ignore */ }
          <MenuButton 
            textColor="brand.text"
            bg={LIGHT_GRAY} 
            as={Button} 
            rightIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M26 12L16 22L6 12" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            }
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
                  <div style={{ marginRight: '8px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="white">
                      <path d="M4 7H28V24C28 24.2652 27.8946 24.5196 27.7071 24.7071C27.5196 24.8946 27.2652 25 27 25H5C4.73478 25 4.48043 24.8946 4.29289 24.7071C4.10536 24.5196 4 24.2652 4 24V7Z" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M28 7L16 18L4 7" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
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
                <div style={{ marginRight: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4V23" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 14L16 23L25 14" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 27H27" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
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
        <Button onClick={() => setCurrentStep(!twoFactorAuthEnabled ? ModalStep.LOGIN_DONE : ModalStep.SETUP_2FA)} marginTop='44px' width='100%'>
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
