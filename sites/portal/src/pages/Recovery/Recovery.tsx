import { Box, ChakraProvider, HStack, Text, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import './recovery.css';
import { truncateEthAddress, RecoveryStatus } from '@usecapsule/web-sdk';
import EmailContext from '../../recovery/contexts/EmailContext';
import PhoneContext from '../../recovery/contexts/PhoneContext';
import RecoveryButton from '../../recovery/components/attempt/RecoveryButton';
import { RecoveryAttemptContext, RecoveryType } from '../../recovery/contexts/RecoveryAttemptContext';
import StepContext from '../../recovery/contexts/StepContext';
import { ModalStep } from '../../recovery/steps/attemptSteps';
import { ModalStep as RecoveryModalStep } from '../../recovery/steps/recoverySteps';
import useCurrentStepState from '../../recovery/hooks/useCurrentStepState';
import WalletContext from '../../recovery/contexts/WalletContext';
import RecoveryTimer from '../../recovery/components/recover/RecoveryTimer';
import RecoveryCancelButton from '../../recovery/components/cancel/RecoveryCancelButton';
import RecoveryStepContext from '../../recovery/contexts/RecoveryStepContext';
import useCurrentRecoveryStepState from '../../recovery/hooks/useCurrentRecoveryStepState';
import UserContext from '../../recovery/contexts/UserContext';
import useEmailState from '../../recovery/hooks/useEmailState';
import useAddressState from '../../recovery/hooks/useAddressState';
import useWalletIdState from '../../recovery/hooks/useWalletIdState';
import useUserIdState from '../../recovery/hooks/useUserIdState';
import useStatusState from '../../recovery/hooks/useStatusState';
import useInitiatedAtState from '../../recovery/hooks/useInitiatedAtState';
import TwoFactorContext from '../../recovery/contexts/TwoFactorContext';
import { newTheme } from '../../theme';
import usePhoneState from '../../recovery/hooks/usePhoneState';
import use2FAState from '../../recovery/hooks/use2FAState';
import useRecoveryTypeState from '../../recovery/hooks/useRecoveryTypeState';
import useTwoFactorVerifiedState from '../../recovery/hooks/useTwoFactorVerifiedState';
import useCountryCodeState from '../../recovery/hooks/useCountryCodeState';
import { CountryCallingCode } from 'libphonenumber-js';

const paragraphStyle = {
  fontSize: '90%',
  lineHeight: 1,
};

const Recovery: React.FC = () => {
  const [email, setEmail] = useEmailState(null);
  const [phone, setPhone] = usePhoneState(null);
  const [countryCode, setCountryCode] = useCountryCodeState(null as CountryCallingCode);
  const [currentStep, setCurrentStep] = useCurrentStepState(ModalStep.EMAIL_COLLECTION);
  const [currentRecoveryStep, setCurrentRecoveryStep] = useCurrentRecoveryStepState(RecoveryModalStep.VERIFY_2FA);
  const [address, setAddress] = useAddressState(null);
  const [walletId, setWalletId] = useWalletIdState(null);
  const [userId, setUserId] = useUserIdState(null);
  const [status, setStatus] = useStatusState(null as RecoveryStatus);
  const [initiatedAt, setInitiatedAt] = useInitiatedAtState(null);
  const [is2FAFlow, setIs2FAFlow] = use2FAState(null as boolean);
  const [type, setType] = useRecoveryTypeState(null as RecoveryType);
  const [twoFactorVerifiedInSession, setTwoFactorVerifiedInSession] = useTwoFactorVerifiedState(null as boolean);

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
  }, []);

  return (
    <ChakraProvider theme={newTheme}>
      <div className="App">
        <h1>Recovery Portal</h1>
        <p>Welcome to the Capsule Recovery Portal</p>
        <p>Here you'll be able to regain access to your account</p>
        {!address && (
          <p>
            If you have already initiated the recovery process for your account, <strong>Log In</strong> to check the status
          </p>
        )}
        <p>The Recovery Process has 2 steps:</p>
        <div className="indent">
          <ol>
            <li>
              Initiate a <strong>Recovery Attempt</strong>. To do this, you'll need to confirm your email
            </li>
            <li>Enter your 2FA code if you had it set up for your Capsule Wallet, and begin to recover your wallet.</li>
          </ol>
        </div>
        <div className="button-container">
          <PhoneContext.Provider value={{ phone, setPhone, countryCode, setCountryCode }}>
            <UserContext.Provider value={{ id: userId, setId: setUserId }}>
              <RecoveryStepContext.Provider value={{ currentRecoveryStep, setCurrentRecoveryStep }}>
                <RecoveryAttemptContext.Provider
                  value={{
                    status,
                    setStatus,
                    initiatedAt,
                    setInitiatedAt,
                    type,
                    setType,
                    twoFactorVerifiedInSession,
                    setTwoFactorVerifiedInSession,
                  }}
                >
                  <StepContext.Provider value={{ currentStep, setCurrentStep }}>
                    <WalletContext.Provider
                      value={{
                        address,
                        setAddress,
                        id: walletId,
                        setId: setWalletId,
                      }}
                    >
                      <EmailContext.Provider value={{ email, setEmail }}>
                        <TwoFactorContext.Provider value={{ is2FAFlow, setIs2FAFlow }}>
                          <VStack align="stretch">
                            <HStack style={{ marginBottom: 40 }}>
                              <Box as="div" flexShrink={0}>
                                <RecoveryButton />
                              </Box>
                              {address && <Text textColor={'brand.addressColor'}>{truncateEthAddress(address)}</Text>}
                            </HStack>
                            <Box style={{ marginBottom: -40 }}>
                              <p style={paragraphStyle}>
                                Please note, if you don't have 2FA set up, there will be a <strong>48-hour</strong> waiting
                                period, during which
                              </p>
                              <p style={paragraphStyle}>
                                you may cancel the recovery attempt at any point. At the end of this waiting period, you will
                                have <strong>24 hours</strong>
                              </p>
                              <p style={paragraphStyle}>
                                to come back and register your new device. If this time window is exceeded, you'll need to
                                initiate another Recovery Attempt.
                              </p>
                            </Box>
                            {address && <RecoveryTimer />}
                            {address && status !== RecoveryStatus.FINISHED && <RecoveryCancelButton />}
                          </VStack>
                        </TwoFactorContext.Provider>
                      </EmailContext.Provider>
                    </WalletContext.Provider>
                  </StepContext.Provider>
                </RecoveryAttemptContext.Provider>
              </RecoveryStepContext.Provider>
            </UserContext.Provider>
          </PhoneContext.Provider>
        </div>
      </div>
    </ChakraProvider>
  );
};

export default Recovery;
