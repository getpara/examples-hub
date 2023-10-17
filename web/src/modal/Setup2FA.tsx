import { VStack, Spacer, Button, Box, Text, useTheme, Input } from '@chakra-ui/react';
import { useEffect, useState, useContext } from 'react';
import QRCode from 'react-qr-code';
import { ModalStep } from './steps';
import { Capsule } from '../Capsule';
import FlowContext from './FlowContext';
import { CoreCapsule } from '../core/CoreCapsule';

export function Setup2FA({
  setCurrentStep,
  capsule,
}: {
  setCurrentStep: (newValue: ModalStep) => void;
  capsule: Capsule | CoreCapsule;
}) {
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const {
    colors: {
      brand: { dimmed: bgColor, background: fgColor },
    },
  } = useTheme();

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
  }

  return (
    <VStack flex={1} alignItems="center">
      <Text fontSize="22px">Optional: Set up 2FA</Text>
      <Box display='flex' flexDirection='column' alignItems='center' width='274px'>
        <Text
          lineHeight='18px'
          fontWeight={500}
          textAlign='center'
          marginTop='8px'
        >
          Add extra protection to your account and enable
          faster recovery.
        </Text>
        <Text
          lineHeight='18px'
          fontWeight={500}
          textAlign='center'
          marginTop='16px'
        >
          Open your preferred Two Factor Auth App and
          scan the code to complete.
        </Text>
        {
          qrCodeValue ? (
            <VStack width='100%'>
              <Box
                cursor="pointer"
                backgroundColor="brand.dimmed"
                borderRadius="12px"
                padding="12px"
                width='188px'
                height='188px'
                marginTop='16px'
              >
                <QRCode
                  fgColor={fgColor}
                  bgColor={bgColor}
                  size={165}
                  value={qrCodeValue}
                />
              </Box>
              <Spacer />
              <Text
                alignSelf="start"
                fontSize="12px"
                fontWeight={500}
                lineHeight='16px'
                textColor="#838587"
                marginBottom="-4px !important" // sorry!
              >
                2FA code
              </Text>
              <Input
                type="string"
                errorBorderColor='red.500'
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
              {incorrectCode && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">Incorrect Code</Text>}
            </VStack>)
            : <Box mb='128px' mt='128px'><Text>Loading...</Text></Box>
        }
        <Spacer />
        <Button
          w="100%"
          onClick={async () => {
            if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
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
          marginTop='14px'
        >
          Continue
        </Button>
        <Button
          variant='link'
          onClick={() => nextStep()}
        >
          <Text
            fontSize='12px'
            fontWeight={500}
            lineHeight='16px'
            textColor='#838587'
            position='relative'
            bottom='-8px'
          >
            Skip for now
          </Text>
        </Button>
      </Box>
    </VStack>
  );
}
