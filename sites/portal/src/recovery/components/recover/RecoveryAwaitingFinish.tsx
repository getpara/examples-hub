import { Flex, CircularProgress, Text } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import { ModalStep } from '../../steps/recoverySteps';
import UserContext from '../../contexts/UserContext';
import WalletContext from '../../contexts/WalletContext';
import { useCapsule } from '../../../components/CapsuleContext';

const RecoveryAwaitingFinishStep: React.FC = () => {
  const capsule = useCapsule();
  const [percentDone, setPercentDone] = useState(0);
  const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
  const { id: userId } = useContext(UserContext);
  const { wallets } = useContext(WalletContext);

  useEffect(() => {
    const finishRecovery = async () => {
      setCurrentRecoveryStep(ModalStep.FINISH);

      const finalizePromises = wallets.map(w => capsule.ctx.capsuleClient.finalizeRecovery(userId, w.id));

      await Promise.all(finalizePromises);
    };

    if (percentDone >= 100) {
      finishRecovery();
      return;
    }

    const increment = 5;
    const timeoutId = setTimeout(
      () => {
        setPercentDone(oldPercentDone => Math.min(100, oldPercentDone + increment));
      },
      2000 / (100 / increment),
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [percentDone]);

  return (
    <>
      <Text fontSize="l" position="absolute">
        Finishing Recovery
      </Text>
      <Flex flex={1} justifyContent="center" alignItems="center">
        <CircularProgress
          size="60px"
          thickness="10px"
          color={'brand.content'}
          trackColor={'brand.contentSecondary'}
          value={percentDone}
        />
      </Flex>
    </>
  );
};

export default RecoveryAwaitingFinishStep;
