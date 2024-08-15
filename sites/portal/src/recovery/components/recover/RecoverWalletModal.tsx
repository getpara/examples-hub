import { Modal, ModalOverlay, ModalContent, ModalBody, VStack } from '@chakra-ui/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { distributeNewShare } from '@usecapsule/web-sdk';
import { RecoveryHeader } from '../header/RecoveryHeader';
import RecoveryLost2FA from '../RecoveryLost2FAStep';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep, ModalStepNumber } from '../../steps/recoverySteps';
import RecoveryWallet2FAStep from './RecoveryWallet2FAStep';
import RecoverWalletWithSecretStep from './RecoverWalletWithSecretStep';
import RecoveryAwaitingFinishStep from './RecoveryAwaitingFinish';
import RecoveryBiometricsSetup from './RecoveryBiometricsSetup';
import RecoveryDoneStep from './RecoveryDoneStep';
import { Footer } from '../Footer/Footer';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import TwoFactorContext from '../../contexts/TwoFactorContext';
import { useCapsule } from '../../../components/CapsuleContext';

type RecoveryWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RecoveryWalletModal: React.FC<RecoveryWalletModalProps> = ({ isOpen, onClose }) => {
  const capsule = useCapsule();
  const { currentRecoveryStep, setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  const [userShares, setUserShares] = useState<string[]>(null);
  const createAccountTimeout = useRef<number>();
  const { twoFactorVerifiedInSession } = useContext(RecoveryAttemptContext);
  const { is2FAFlow } = useContext(TwoFactorContext);

  async function awaitWalletRecoveryTransition(): Promise<void> {
    try {
      if (await capsule.isSessionActive()) {
        setWebAuthURLForCreate('');
        setCurrentRecoveryStep(ModalStep.AWAITING_FINISH);
        return;
      }
    } catch (err) {
      // want to continue polling on error and still set timeout
      console.error(err);
    }
    createAccountTimeout.current = window.setTimeout(awaitWalletRecoveryTransition, 1000);
  }

  // wait for biometric to be added to move on to next step
  useEffect(() => {
    if (webAuthURLForCreate) {
      createAccountTimeout.current = window.setTimeout(awaitWalletRecoveryTransition, 1000);
    }
    return () => clearTimeout(createAccountTimeout.current);
  }, [webAuthURLForCreate]);

  useEffect(() => {
    async function distribute() {
      if (userShares && currentRecoveryStep === ModalStep.AWAITING_FINISH) {
        const fetchedWallets = await capsule.fetchWallets();
        const walletId = fetchedWallets[0].id;
        await Promise.all(
          userShares.map(userShare => distributeNewShare(capsule.ctx, capsule.getUserId(), walletId, userShare, true, {})),
        );
        setUserShares(null);
      }
    }
    distribute();
  }, [userShares, currentRecoveryStep]);

  useEffect(() => {
    if (!is2FAFlow || twoFactorVerifiedInSession) {
      setCurrentRecoveryStep(ModalStep.SECRET);
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor={'brand.background'} width="356px" height="632px">
        <ModalBody padding={0} display="flex" flexDirection="column">
          <RecoveryHeader step={ModalStepNumber[currentRecoveryStep]} onClose={onClose} />
          <VStack alignItems="center" display="flex" flex={1} margin="22px 22px 0px">
            {currentRecoveryStep === ModalStep.VERIFY_2FA && <RecoveryWallet2FAStep />}
            {currentRecoveryStep === ModalStep.SECRET && (
              <RecoverWalletWithSecretStep setWebAuthURLForCreate={setWebAuthURLForCreate} setUserShares={setUserShares} />
            )}
            {currentRecoveryStep === ModalStep.LOST_2FA && <RecoveryLost2FA onClose={onClose} />}
            {currentRecoveryStep === ModalStep.BIOMETRIC && <RecoveryBiometricsSetup url={webAuthURLForCreate} />}
            {currentRecoveryStep === ModalStep.FINISH && <RecoveryDoneStep onClose={onClose} />}
            {currentRecoveryStep === ModalStep.AWAITING_FINISH && <RecoveryAwaitingFinishStep />}
          </VStack>
          <Footer />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RecoveryWalletModal;
