import { VStack, Spacer, HStack, Input, Button, Box, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import EmailContext from '../../contexts/EmailContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep } from '../../steps/recoverySteps';
import UserContext from '../../contexts/UserContext';
import WalletContext from '../../contexts/WalletContext';
import VerifyCode from '../../../assets/verifyCode';
import Console from '../../../assets/console';
import TwoFactorContext from '../../contexts/TwoFactorContext';
import { RecoveryAttemptContext, RecoveryType } from '../../contexts/RecoveryAttemptContext';
import PhoneContext from '../../contexts/PhoneContext';
import { useCapsule } from '../../../components/CapsuleContext';

const RecoveryWallet2FAStep: React.FC = () => {
  const capsule = useCapsule();
  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { type } = useContext(RecoveryAttemptContext);
  const { email } = useContext(EmailContext);
  const { setId: setWalletId } = useContext(WalletContext);
  const { phone, countryCode } = useContext(PhoneContext);
  const { setId: setUserId } = useContext(UserContext);
  const { is2FAFlow } = useContext(TwoFactorContext);

  if (!is2FAFlow) {
    setCurrentRecoveryStep(ModalStep.SECRET);
  }

  return (
    <VStack flex={1}>
      <Text textColor="brand.content" fontSize="l">
        2FA Code
      </Text>
      <Console />

      <Spacer width="8px" />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <VerifyCode />
        </Box>
        <Box>
          <Text textColor="brand.content" fontSize="m">
            Confirm 2FA
          </Text>
          <Text textColor="brand.content" fontSize="s">
            Enter the 6-digit authentication code via SMS or the authenticator app you used to set up Capsule.
          </Text>
        </Box>
      </HStack>

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
        errorBorderColor="red.500"
        isInvalid={incorrectCode}
        borderColor="brand.frameColor"
        textColor="brand.text"
        background="rgba(255, 255, 255, 0.05)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="5px"
        focusBorderColor="brand.text"
        placeholder="Enter code"
        onChange={async e => {
          setVerificationCode(e.target.value);
        }}
      />
      {incorrectCode && (
        <Text alignSelf="flex-start" color="red.500" fontSize="x-small">
          Incorrect Code
        </Text>
      )}
      <Spacer />
      <Button
        width="100%"
        onClick={async () => {
          if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
            try {
              let walletId, userId;
              if (type === RecoveryType.PHONE) {
                ({ walletId, userId } = await capsule.verify2FAForPhone(phone, countryCode, verificationCode));
              } else {
                ({ walletId, userId } = await capsule.verify2FA(email, verificationCode));
              }
              setWalletId(walletId);
              setUserId(userId);
              setIncorrectCode(false);
              setCurrentRecoveryStep(ModalStep.SECRET);
            } catch (error) {
              setIncorrectCode(true);
            }
          } else {
            setIncorrectCode(true);
          }
        }}
      >
        Continue
      </Button>
      <Button variant="link" onClick={() => setCurrentRecoveryStep(ModalStep.LOST_2FA)}>
        <Text fontSize={11}>I lost access to my 2FA</Text>
      </Button>
    </VStack>
  );
};

export default RecoveryWallet2FAStep;
