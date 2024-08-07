import { VStack, Spacer, HStack, Button, Box, Text, Textarea } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import capsule from '../../../clients/capsule';
import { KeyContainer } from '@usecapsule/web-sdk';
import EmailContext from '../../contexts/EmailContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep } from '../../steps/recoverySteps';
import UserContext from '../../contexts/UserContext';
import WalletContext from '../../contexts/WalletContext';
import VerifyCode from '../../../assets/verifyCode';
import { RecoveryAttemptContext, RecoveryType } from '../../contexts/RecoveryAttemptContext';
import PhoneContext from '../../contexts/PhoneContext';

async function recoverUserShares(userId: string, walletId: string, serializedRecoveryShare: string): Promise<string[]> {
  const recoveryPrivateKeyContainer = KeyContainer.buildFrom(serializedRecoveryShare);

  const res = await capsule.ctx.capsuleClient.recoverUserShares(userId, walletId);
  const { keyShares, keyShare } = res.data;
  if (!keyShares?.length) {
    return [recoveryPrivateKeyContainer.decrypt(keyShare.encryptedShare)];
  }
  return keyShares.map(ks => recoveryPrivateKeyContainer.decrypt(ks.encryptedShare));
}

type RecoverWalletWithSecretStepProps = {
  setWebAuthURLForCreate: (webAuthURLForCreate: string | null) => void;
  setUserShares: (userShares: string[] | null) => void;
};

const RecoverWalletWithSecretStep: React.FC<RecoverWalletWithSecretStepProps> = ({
  setWebAuthURLForCreate,
  setUserShares,
}) => {
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { type } = useContext(RecoveryAttemptContext);
  const { phone, countryCode } = useContext(PhoneContext);
  const { email } = useContext(EmailContext);
  const { id: walletId } = useContext(WalletContext);
  const { id: userId } = useContext(UserContext);
  const [secret, setSecret] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);

  return (
    <VStack flex={1}>
      <Text textColor="brand.content" fontSize="l">
        Recovery Secret
      </Text>
      <Spacer width="8px" />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <VerifyCode />
        </Box>
        <Box>
          <Text marginBottom={2} textColor="brand.content" fontSize="m">
            Confirm Recovery Secret
          </Text>
          <Text textColor="brand.content" fontSize="s">
            In onboarding you should have received an email titled "Capsule Recovery". Find that text and paste it into the
            field below.
          </Text>
        </Box>
      </HStack>
      <Spacer />
      <Text
        alignSelf="start"
        fontSize="s"
        textColor="brand.contentSecondary"
        marginBottom="-8px !important" // sorry!
      >
        Recovery Secret
      </Text>
      <Textarea
        errorBorderColor="red.500"
        isInvalid={incorrectCode}
        borderColor="brand.frameColor"
        textColor="brand.text"
        background="rgba(255, 255, 255, 0.05)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="5px"
        focusBorderColor="brand.text"
        placeholder="Enter secret"
        onChange={async e => {
          setSecret(e.target.value);
        }}
      />
      {incorrectCode && (
        <Text alignSelf="flex-start" color="red.500" fontSize="x-small">
          Incorrect Secret
        </Text>
      )}
      <Spacer />
      <Button
        width="100%"
        onClick={async () => {
          try {
            const userShares = await recoverUserShares(userId, walletId, secret);
            setUserShares(userShares);
            setIncorrectCode(false);
            await capsule.setEmail(email);
            await capsule.setPhoneNumber(phone, countryCode);
            await capsule.setUserId(userId);
            let link;
            if (type === RecoveryType.PHONE) {
              link = await capsule.getSetUpBiometricsURLForPhone(false);
            } else {
              link = await capsule.getSetUpBiometricsURL(false);
            }
            setWebAuthURLForCreate(link);
            setCurrentRecoveryStep(ModalStep.BIOMETRIC);
          } catch (error) {
            setIncorrectCode(true);
          }
        }}
      >
        Continue
      </Button>
    </VStack>
  );
};

export default RecoverWalletWithSecretStep;
