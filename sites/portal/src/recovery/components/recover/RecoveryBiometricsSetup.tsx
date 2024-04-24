import { Box, Text, Spacer, VStack, useTheme, HStack } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import Identity from '../../../assets/identity';

type RecoveryBiometricsSetupProps = {
  url: string;
};

const RecoveryBiometricsSetup: React.FC<RecoveryBiometricsSetupProps> = ({ url }) => {
  const {
    colors: {
      brand: { dimmed: bgColor, background: fgColor },
    },
  } = useTheme();

  return (
    <VStack flex={1} alignItems="center">
      <Text fontSize="l">Finish Recovery</Text>
      <Text textColor="brand.text" fontSize="s" width="90%" textAlign="center">
        Scan or click this QR code to recover your account to a new device.
      </Text>
      <Box cursor="pointer" backgroundColor="brand.dimmed" borderRadius="12px" padding="18px">
        <QRCode
          value={url}
          size={180}
          fgColor={fgColor}
          bgColor={bgColor}
          onClick={() => {
            window.open(url, '_blank');
          }}
        />
      </Box>
      <Spacer />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <Identity />
        </Box>
        <Box>
          <Text textColor="brand.content" fontSize="m">
            Verify Identity
          </Text>
          <Text textColor="brand.content" fontSize="s">
            Follow the modal prompts that appear to ask you to verify.
          </Text>
        </Box>
      </HStack>
      <Spacer />
    </VStack>
  );
};

export default RecoveryBiometricsSetup;
