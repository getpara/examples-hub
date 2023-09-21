import { VStack, Spacer, Button, Box, Text, useTheme, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { ModalStep } from './steps';
import { Capsule } from '../Capsule';

export function Setup2FA({
    email,
    setCurrentStep,
    capsule,
}: {
    email: string;
    setCurrentStep: (newValue: ModalStep) => void;
    capsule: Capsule;
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

    return (
        <VStack flex={1} alignItems="center">
            <Text fontSize="l">2FA setup</Text>
            <Text textColor="brand.text" fontSize="s" width="90%" textAlign="center">
                Scan this QR code to setup two-factor authentication.
            </Text>
            <Spacer />
            {
                qrCodeValue ? (
                    <VStack>
                        <Box
                            cursor="pointer"
                            backgroundColor="brand.dimmed"
                            borderRadius="12px"
                            padding="18px"
                        >
                            <QRCode
                                fgColor={fgColor}
                                bgColor={bgColor}
                                size={180}
                                value={qrCodeValue}
                            />
                        </Box>
                        <Spacer />
                        <Text
                            alignSelf="start"
                            fontSize="s"
                            textColor="brand.contentSecondary"
                            marginBottom="-8px !important" // sorry!
                        >
                            6 digit code
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
                    : <Text>Loading...</Text>
            }
            <Spacer />
            <Button
                w="100%"
                onClick={async () => {
                    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
                        try {
                            await capsule.enable2FA(verificationCode);
                            setIncorrectCode(false);
                            setCurrentStep(ModalStep.DONE_2FA);
                        } catch (e) {
                            setIncorrectCode(true);
                        }
                    } else {
                        setIncorrectCode(true);
                    }
                }}
            >
                Continue
            </Button>
        </VStack>
    );
}