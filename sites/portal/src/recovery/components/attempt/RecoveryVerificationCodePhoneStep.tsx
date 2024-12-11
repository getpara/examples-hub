import { VStack, Spacer, HStack, Input, Button, Text, Box } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { RecoveryAttemptContext, RecoveryType } from '../../contexts/RecoveryAttemptContext';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import WalletContext from '../../contexts/WalletContext';
import VerifyCode from '../../../assets/verifyCode';
import Console from '../../../assets/console';
import PhoneContext from '../../contexts/PhoneContext';
import UserContext from '../../contexts/UserContext';
import TwoFactorContext from '../../contexts/TwoFactorContext';
import { RecoveryStatus } from '@usecapsule/core-sdk';
import { useCapsule } from '../../../components/CapsuleContext';

type RecoveryVerificationCodePhoneStepProps = {
  onClose: () => void;
};

const RecoveryVerificationCodePhoneStep: React.FC<RecoveryVerificationCodePhoneStepProps> = ({ onClose }) => {
  const capsule = useCapsule();
  const { setCurrentStep } = useContext(StepContext);
  const { phone, countryCode } = useContext(PhoneContext);
  const { setWallets } = useContext(WalletContext);
  const { setStatus, setInitiatedAt, setType } = useContext(RecoveryAttemptContext);
  const { setIs2FAFlow } = useContext(TwoFactorContext);
  const { setId: setUserId } = useContext(UserContext);

  const [verificationCode, setVerificationCode] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);
  const [tooManyAttempts, setTooManyAttempts] = useState(false);
  const [resendStatus, setResendStatus] = useState('Resend Code');
  const [isResendButtonDisabled, setResendButtonDisabled] = useState(false);
  return (
    <VStack flex={1}>
      <Text textColor="brand.content" fontSize="l">
        Verify Phone
      </Text>
      <Console />

      <Spacer width="8px" />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <VerifyCode />
        </Box>
        <Box>
          <Text textColor="brand.content" fontSize="m">
            Verify phone
          </Text>
          <Text textColor="brand.content" fontSize="s">
            Enter the 6-digit authentication code that was sent to your phone to verify your signup.
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
        isDisabled={tooManyAttempts}
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
      {tooManyAttempts && (
        <Text alignSelf="flex-start" color="red.500" fontSize="x-small">
          Too many incorrect attempts. Please try again in 10 minutes.
        </Text>
      )}
      <Spacer />
      <Button
        width="100%"
        onClick={async () => {
          if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
            try {
              const res = await capsule.ctx.capsuleClient.verifyPhoneForRecovery(phone, countryCode, verificationCode);
              const status = res.data.status;
              const initiatedAt = res.data.initiatedAt as Date;
              const skip2FA = res.data.skip2FA as boolean;
              const userId = res.data.userId;
              const wallets = res.data.wallets;
              setIs2FAFlow(!skip2FA);
              if (skip2FA) {
                setUserId(userId);
                setWallets(wallets);
              }
              setType(RecoveryType.PHONE);
              if (status != null) {
                setWallets(wallets);
                setStatus(status);
                setInitiatedAt(initiatedAt);
                if (status === RecoveryStatus.INITIATED) {
                  setCurrentStep(ModalStep.RECOVERY_AWAITING);
                } else {
                  onClose();
                }
              } else {
                setIncorrectCode(false);
                setCurrentStep(ModalStep.VERIFY_2FA_PHONE);
              }
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
      <Button
        variant="link"
        isDisabled={isResendButtonDisabled || tooManyAttempts}
        onClick={async () => {
          setResendStatus('Code Resent!');
          setResendButtonDisabled(true);
          await capsule.ctx.capsuleClient.initializeRecoveryForPhone(phone, countryCode);

          setTimeout(() => {
            setResendStatus('Resend Code');
            setResendButtonDisabled(false);
          }, 3000);
        }}
      >
        <Text fontSize={11}>{resendStatus}</Text>
      </Button>
    </VStack>
  );
};

export default RecoveryVerificationCodePhoneStep;
