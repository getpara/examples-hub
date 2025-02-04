import { Button, HStack, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import EmailContext from '../../contexts/EmailContext';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import RecoveryModal from '../../components/attempt/RecoveryModal';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import { ModalStep as RecoveryModalStep } from '../../steps/recoverySteps';
import WalletContext from '../../contexts/WalletContext';
import ParaSmall from '../../../assets/paraSmall';
import TwoFactorContext from '../../contexts/TwoFactorContext';
import UserContext from '../../contexts/UserContext';
import PhoneContext from '../../contexts/PhoneContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { usePara } from '../../../components/ParaContext';

const RecoveryButton: React.FC = () => {
  const para = usePara();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { wallets, setWallets } = useContext(WalletContext);
  const { setId: setUserId } = useContext(UserContext);
  const { setEmail } = useContext(EmailContext);
  const { setPhone } = useContext(PhoneContext);
  const { setCurrentStep } = useContext(StepContext);
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { setStatus, setInitiatedAt, setType, setTwoFactorVerifiedInSession } = useContext(RecoveryAttemptContext);
  const { setIs2FAFlow } = useContext(TwoFactorContext);
  return (
    <Button
      width={'180px'}
      height={'50px'}
      backgroundColor={'brand.background'}
      color={'white'}
      onClick={async () => {
        if (!!wallets?.length) {
          setEmail(null);
          setPhone(null);
          setWallets(null);
          setStatus(null);
          setInitiatedAt(null);
          setType(null);
          setTwoFactorVerifiedInSession(null);
          setUserId(null);
          setIs2FAFlow(null);
          setCurrentStep(ModalStep.EMAIL_COLLECTION);
          setCurrentRecoveryStep(RecoveryModalStep.VERIFY_2FA);
          await para.logout();
        } else {
          setModalIsOpen(true);
        }
      }}
    >
      <RecoveryModal onClose={() => setModalIsOpen(false)} isOpen={modalIsOpen} />
      <HStack>
        <Text size="18px" marginRight="9px">
          {!!wallets?.length ? 'Logout' : 'Manage Recovery'}
        </Text>
      </HStack>
      <div>
        <ParaSmall />
      </div>
    </Button>
  );
};

export default RecoveryButton;
