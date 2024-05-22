import { Button, HStack, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import EmailContext from '../../contexts/EmailContext';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import RecoveryModal from '../../components/attempt/RecoveryModal';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import { ModalStep as RecoveryModalStep } from '../../steps/recoverySteps';
import WalletContext from '../../contexts/WalletContext';
import capsule from '../../../clients/capsule';
import CapsuleSmall from '../../../assets/capsuleSmall';
import TwoFactorContext from '../../contexts/TwoFactorContext';
import UserContext from '../../contexts/UserContext';
import PhoneContext from '../../contexts/PhoneContext';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';

const RecoveryButton: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { address, setAddress, setId: setWalletId } = useContext(WalletContext);
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
        if (address) {
          setEmail(null);
          setPhone(null);
          setAddress(null);
          setStatus(null);
          setInitiatedAt(null);
          setType(null);
          setTwoFactorVerifiedInSession(null);
          setWalletId(null);
          setUserId(null);
          setIs2FAFlow(null);
          setCurrentStep(ModalStep.EMAIL_COLLECTION);
          setCurrentRecoveryStep(RecoveryModalStep.VERIFY_2FA);
          await capsule.logout();
        } else {
          setModalIsOpen(true);
        }
      }}
    >
      <RecoveryModal onClose={() => setModalIsOpen(false)} isOpen={modalIsOpen} />
      <HStack>
        <Text size="18px" marginRight="9px">
          {address ? 'Logout' : 'Manage Recovery'}
        </Text>
      </HStack>
      <CapsuleSmall />
    </Button>
  );
};

export default RecoveryButton;
