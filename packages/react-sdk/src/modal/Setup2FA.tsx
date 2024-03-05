import {
  VStack,
  Spacer,
  Button,
  Box,
  Text,
  useTheme,
  Input,
  useClipboard,
} from '@chakra-ui/react';
import { useEffect, useState, useContext } from 'react';
import QRCode from 'react-qr-code';
import { ModalStep } from './steps';
import FlowContext from './FlowContext';
import CapsuleWeb from '@usecapsule/web-sdk';

export function Setup2FA({
  setCurrentStep,
  capsule,
}: {
  setCurrentStep: (newValue: ModalStep) => void;
  capsule: CapsuleWeb;
}) {
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const {
    colors: {
      brand: { dimmed: bgColor, background: fgColor },
    },
  } = useTheme();

  const params = qrCodeValue ? new URL(qrCodeValue).searchParams : undefined;
  const secret = params?.get('secret');
  const { onCopy, hasCopied } = useClipboard(secret);

  useEffect(() => {
    async function fetchOtpAuthUrl() {
      try {
        const { uri } = await capsule.setup2FA();
        setQrCodeValue(uri);
      } catch (error) {
        console.error('Error fetching OTPAuth URL:', error);
      }
    }

    fetchOtpAuthUrl();
  }, []);

  const { isLogin } = useContext(FlowContext);

  const nextStep = () => {
    if (isLogin) {
      setCurrentStep(ModalStep.LOGIN_DONE);
    } else {
      setCurrentStep(ModalStep.ACCOUNT_CREATION_DONE);
    }
  };

  return (
    <VStack flex={1} alignItems="center">
      <Text fontSize="22px">Optional: Set up 2FA</Text>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="274px"
      >
        <Text
          lineHeight="18px"
          fontWeight={500}
          textAlign="center"
          marginTop="8px"
        >
          Add extra protection to your account and enable faster recovery.
        </Text>
        <Text
          lineHeight="18px"
          fontWeight={500}
          textAlign="center"
          marginTop="16px"
        >
          Open your preferred Two Factor Auth App and scan the code to complete.
        </Text>
        {qrCodeValue ? (
          <VStack width="100%">
            <Box
              cursor="pointer"
              backgroundColor="brand.dimmed"
              borderRadius="12px"
              padding="12px"
              width="188px"
              height="188px"
              marginTop="16px"
              onClick={onCopy}
            >
              <QRCode
                fgColor={fgColor}
                bgColor={bgColor}
                size={165}
                value={qrCodeValue}
              />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                mt={3}
                cursor="pointer"
                onClick={onCopy}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
                </svg>
                <Text
                  textAlign="center"
                  textDecoration={hasCopied ? 'none' : 'underline'}
                >
                  {hasCopied ? 'Copied' : 'Copy Code'}
                </Text>
              </Box>
            </Box>
            <Spacer />
            <Text
              alignSelf="start"
              fontSize="12px"
              fontWeight={500}
              lineHeight="16px"
              textColor="#838587"
              marginBottom="-4px !important" // sorry!
            >
              2FA code
            </Text>
            <Input
              type="string"
              errorBorderColor="red.500"
              isInvalid={incorrectCode}
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
            {incorrectCode && (
              <Text alignSelf="flex-start" color="red.500" fontSize="x-small">
                Incorrect Code
              </Text>
            )}
          </VStack>
        ) : (
          <Box mb="128px" mt="128px">
            <Text>Loading...</Text>
          </Box>
        )}
        <Spacer />
        <Button
          w="100%"
          onClick={async () => {
            if (
              verificationCode.length === 6 &&
              /^\d+$/.test(verificationCode)
            ) {
              try {
                await capsule.enable2FA(verificationCode);
                setIncorrectCode(false);
                nextStep();
              } catch (e) {
                setIncorrectCode(true);
              }
            } else {
              setIncorrectCode(true);
            }
          }}
          marginTop="14px"
        >
          Continue
        </Button>
        <Button variant="link" onClick={() => nextStep()}>
          <Text
            fontSize="12px"
            fontWeight={500}
            lineHeight="16px"
            textColor="#838587"
            position="relative"
            bottom="-8px"
          >
            Skip for now
          </Text>
        </Button>
      </Box>
    </VStack>
  );
}
