import { ModalStep } from './steps';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Capsule } from '../Capsule';
import Console from './assets/console';
import VerifyCode from './assets/verifyCode';
import { CoreCapsule } from '../core/CoreCapsule';
import './css/modal.css'

export function VerificationCodeStep({
  setWebAuthURLForCreate,
  setCurrentStep,
  currentStep,
  capsule,
  email,
}: {
  capsule: Capsule | CoreCapsule;
  setCurrentStep: (newValue: ModalStep) => void;
  currentStep: ModalStep;
  setWebAuthURLForCreate: (newValue: string) => void;
  email: string;
}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const [tooManyAttempts, setTooManyAttempts] = useState(false);
  const [resendStatus, setResendStatus] = useState('Resend Code');
  const [isResendButtonDisabled, setResendButtonDisabled] = useState(false);

  const handleClick = async () => {
    setResendStatus("Code Resent!");
    setResendButtonDisabled(true);
    await capsule.resendVerificationCode();

    setTimeout(() => {
      setResendStatus("Resend Code");
      setResendButtonDisabled(false);
    }, 3000);
  };

  const [fontSize, setFontSize] = useState("20px");
  
  useEffect(() => {
    if (!email) {
      setFontSize("20px");
      return;
    }
    else if (email.length > 30) {
      setFontSize("14px");
      return;
    }
    else if (email.length > 28) {
      setFontSize("16px");
      return;
    }
    else if (email.length > 24) { 
      setFontSize("18px");
      return;
    } else {
      setFontSize("20px");
      return;
    }
  }, [email]);

  if (currentStep !== ModalStep.VERIFICATION_CODE) {
    return null;
  }
  return (
    <>
      <VStack flex={1}>
        <Text position='relative' top='-4px' textColor="brand.content" fontSize="22px">
          Verify email
        </Text>
        <Box position="relative" top="-10px">
          <Console />
        </Box>
        <Box position='relative' top='-10px' display="flex" flexDirection='column' alignItems='center'>
          <Box width="274px">
            <Text 
              top="8px" 
              position="relative" 
              textAlign="center" 
              textColor="brand.content" 
              fontSize="20px"
            >
              Enter the 6-digit authentication code sent to{' '}
              <Box as="span" display="inline-block" maxWidth="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                <Text as="b" display="inline" fontSize={fontSize}>{email}</Text>
              </Box>
            </Text>
            <Text
              alignSelf="start"
              fontSize="12px"
              fontWeight={500}
              lineHeight='16px'
              textColor="#838587"
              marginTop="24px"
            >
              6-digit code
            </Text>
            <Input
              marginTop='4px'
              type="string"
              errorBorderColor='red.500'
              isInvalid={incorrectCode}
              isDisabled={tooManyAttempts}
              borderColor="brand.frameColor"
              textColor="brand.text"
              background="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="5px"
              focusBorderColor="brand.text"
              placeholder="Enter code"
              onChange={async (e) => {
                setVerificationCode(e.target.value);
              }}
            />
            {incorrectCode && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">Incorrect Code</Text>}
            {tooManyAttempts && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">Too many incorrect attempts. Please try again in 10 minutes.</Text>}
            <Spacer />
            <Button
              marginTop="48px"
              width="100%"
              onClick={async () => {
                if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
                  try {
                    setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
                    setIncorrectCode(false);
                    setCurrentStep(ModalStep.BIOMETRIC_CREATION);
                  } catch (e) {
                    if (e.message.includes('429')) {
                      setIncorrectCode(false);
                      setTooManyAttempts(true);
                    } else {
                      setIncorrectCode(true);
                      setTooManyAttempts(false);
                    }
                  }
                } else {
                  setIncorrectCode(true);
                }
              }}
            >
              Continue
            </Button>
          </Box>
          <Button
            variant="link"
            onClick={async () => {
              await handleClick();
            }}
            isDisabled={isResendButtonDisabled || tooManyAttempts}
            marginTop='8px'
          >
            <Text fontSize={11}>{resendStatus}</Text>
          </Button>
        </Box>
      </VStack>
    </>
  );
}
