import { Flex, CircularProgress, Text } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import TwoFactorContext from '../../contexts/TwoFactorContext';

const RecoveryAwaitingInitiationStep: React.FC = () => {
  const [percentDone, setPercentDone] = useState(0);
  const { setCurrentStep } = useContext(StepContext);
  const { is2FAFlow } = useContext(TwoFactorContext);

  useEffect(() => {
    if (percentDone >= 100) {
      if (is2FAFlow) {
        setCurrentStep(ModalStep.RECOVERY_READY);
      } else {
        setCurrentStep(ModalStep.RECOVERY_INITIATED);
      }
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
        Initiating Recovery
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

export default RecoveryAwaitingInitiationStep;
