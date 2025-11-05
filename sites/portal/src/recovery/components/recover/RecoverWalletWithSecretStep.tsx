import { VStack, Spacer, HStack, Button, Box, Text, Textarea } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { formatPhoneNumber, KeyContainer } from '@getpara/web-sdk';
import EmailContext from '../../contexts/EmailContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep } from '../../steps/recoverySteps';
import UserContext from '../../contexts/UserContext';
import WalletContext from '../../contexts/WalletContext';
import VerifyCode from '../../../assets/verifyCode';
import PhoneContext from '../../contexts/PhoneContext';
import { usePara } from '../../../components/ParaContext';

type RecoverWalletWithSecretStepProps = {
  setWebAuthURLForCreate: (webAuthURLForCreate: string | null) => void;
  setUserShares: (userShares: { walletId: string; decryptedShare: string }[] | null) => void;
};

const RecoverWalletWithSecretStep: React.FC<RecoverWalletWithSecretStepProps> = ({
  setWebAuthURLForCreate,
  setUserShares,
}) => {
  const para = usePara();
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { phone, countryCode } = useContext(PhoneContext);
  const { email } = useContext(EmailContext);
  const { wallets } = useContext(WalletContext);
  const { id: userId } = useContext(UserContext);
  const [secret, setSecret] = useState('');
  const [incorrectCode, setIncorrectCode] = useState(false);

  async function recoverUserShares(): Promise<{ walletId: string; decryptedShare: string }[]> {
    const recoveryPrivateKeyContainer = KeyContainer.buildFrom(secret);

    // Get all the users fully generated wallets
    const allCompleteUserWallets = wallets.filter(wallet => !!wallet.address);

    const recoveryUserSharesPromises = allCompleteUserWallets.map(wal => para.ctx.client.recoverUserShares(userId, wal.id));
    const recoveryUserShares = await Promise.all(recoveryUserSharesPromises);

    const keyShares = recoveryUserShares
      .map(us => (!!us.data.keyShares?.length ? us.data.keyShares : us.data.keyShare))
      .flat();

    return keyShares
      .map(ks => {
        // Ignoring shares with an error here these error should be old shares with a different recovery secret
        try {
          const decryptedShare = recoveryPrivateKeyContainer.decrypt(ks.encryptedShare);
          return { walletId: ks.walletId, decryptedShare };
        } catch {
          return undefined;
        }
      })
      .filter(ks => !!ks);
  }

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
            In onboarding you should have received an email titled "Para Recovery". Find that text and paste it into the
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
            const userShares = await recoverUserShares();
            if (!userShares?.length) {
              setIncorrectCode(true);
              return;
            }
            setUserShares(userShares);
            setIncorrectCode(false);

            let auth;
            switch (true) {
              case !!email:
                auth = { email };
                break;
              case !!phone:
                auth = { phone: formatPhoneNumber(phone, countryCode) };
                break;
            }

            if (!auth) {
              throw new Error('No auth found');
            }

            await para.setAuth(auth, { userId });

            const { url } = await para.getNewCredentialAndUrl({ authMethod: 'PASSKEY' });

            setWebAuthURLForCreate(url);
            setCurrentRecoveryStep(ModalStep.BIOMETRIC);
          } catch {
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
