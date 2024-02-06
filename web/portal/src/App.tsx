import { Box, ChakraProvider, HStack, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import './App.css';
import { darkTheme } from './library/modal/theme';
import { truncateEthAddress } from './library/modal/utils';
import EmailContext from './recovery/contexts/EmailContext';
import RecoveryButton from './recovery/components/attempt/RecoveryButton';
import { RecoveryAttemptContext } from './recovery/contexts/RecoveryAttemptContext';
import StepContext from './recovery/contexts/StepContext';
import { ModalStep } from './recovery/steps/attemptSteps';
import { ModalStep as RecoveryModalStep } from './recovery/steps/recoverySteps';
import useCurrentStepState from './recovery/hooks/useCurrentStepState';
import WalletContext from './recovery/contexts/WalletContext';
import RecoveryTimer from './recovery/components/recover/RecoveryTimer';
import { RecoveryStatus } from './library/Capsule';
import RecoveryCancelButton from './recovery/components/cancel/RecoveryCancelButton';
import RecoveryStepContext from './recovery/contexts/RecoveryStepContext';
import useCurrentRecoveryStepState from './recovery/hooks/useCurrentRecoveryStepState';
import UserContext from './recovery/contexts/UserContext';
import useEmailState from './recovery/hooks/useEmailState';
import useAddressState from './recovery/hooks/useAddressState';
import useWalletIdState from './recovery/hooks/useWalletIdState';
import useUserIdState from './recovery/hooks/useUserIdState';
import useStatusState from './recovery/hooks/useStatusState';
import useInitiatedAtState from './recovery/hooks/useInitiatedAtState';

const App: React.FC = () => {
  const [email, setEmail] = useEmailState(null);
  const [currentStep, setCurrentStep] = useCurrentStepState(ModalStep.EMAIL_COLLECTION);
  const [currentRecoveryStep, setCurrentRecoveryStep] = useCurrentRecoveryStepState(RecoveryModalStep.VERIFY_2FA);
  const [address, setAddress] = useAddressState(null);
  const [walletId, setWalletId] = useWalletIdState(null);
  const [userId, setUserId] = useUserIdState(null);
  const [status, setStatus] = useStatusState(null as RecoveryStatus);
  const [initiatedAt, setInitiatedAt] = useInitiatedAtState(null);

  return (
    <ChakraProvider theme={darkTheme}>
      <div className="App">
        <h1>Recovery Portal</h1>
        <p>Welcome to the Capsule Recovery Portal</p>
        <p>Here you'll be able to regain access to your account</p>
        {!address && <p>If you have already initiated the recovery process for your account, <strong>Log In</strong> to check the status</p>}
        <p>The Recovery Process has 3 steps:</p>
        <div className="indent">
          <ol>
            <li>Initiate a <strong>Recovery Attempt</strong>. To do this, you'll need to confirm your email and enter a 2FA code</li>
            <li>Once initiated, there will be a <strong>48 hour</strong> waiting period. During this time, you may cancel the recovery attempt at any point</li>
            <li>At the end of this waiting period, you will have <strong>24 hours</strong> to come back and register your new device. If this time window is exceeded, you'll need to initiate another Recovery Attempt</li>
          </ol>
        </div>
        <div className="button-container">
          <UserContext.Provider value={{ id: userId, setId: setUserId }}>
            <RecoveryStepContext.Provider value={{ currentRecoveryStep, setCurrentRecoveryStep }}>
              <RecoveryAttemptContext.Provider value={{ status, setStatus, initiatedAt, setInitiatedAt }}>
                <StepContext.Provider value={{ currentStep, setCurrentStep }}>
                  <WalletContext.Provider value={{ address, setAddress, id: walletId, setId: setWalletId }}>
                    <EmailContext.Provider value={{ email, setEmail }}>
                      <VStack align="stretch">
                        <HStack>
                          <Box as="div" flexShrink={0}>
                            <RecoveryButton />
                          </Box>
                          {address && <Text textColor={'brand.addressColor'}>
                            {truncateEthAddress(address)}
                          </Text>}
                        </HStack>
                        {address && <RecoveryTimer />}
                        {address && status !== RecoveryStatus.FINISHED && <RecoveryCancelButton />}
                      </VStack>
                    </EmailContext.Provider>
                  </WalletContext.Provider>
                </StepContext.Provider>
              </RecoveryAttemptContext.Provider>
            </RecoveryStepContext.Provider>
          </UserContext.Provider>
        </div>
      </div>
    </ChakraProvider>
  );
}

export default App;
