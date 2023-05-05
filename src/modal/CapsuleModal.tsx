import React, { useEffect, useRef, useState } from 'react';

import {
  ChakraProvider,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Theme,
  VStack,
} from '@chakra-ui/react';
import { ModalStep } from './steps';
import { EmailCollectionStep } from './EmailCollectionStep';
import { BiometricLoginStep } from './BiometricLoginStep';
import { AwaitingWalletCreationStep } from './AwaitingWalletCreationStep';
import { AccountCreationDoneStep } from './AccountCreationDoneStep';
import { LoginDoneStep } from './LoginDoneStep';
import { BiometricCreationStep } from './BiometricCreationStep';
import { VerificationCodeStep } from './VerificationCodeStep';
import { darkTheme, lightTheme } from './theme';
import { Capsule, Wallet } from '../Capsule';

interface CapsuleModalProps {
  capsule: Capsule;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light' | Theme;
  onRampCurrency?: string;
  onRampAvailable?: boolean;
  rampNetworkApiKey?: string;
}

const themeResolve: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export const CapsuleModal = ({
  capsule,
  isOpen,
  onClose,
  theme = 'dark',
  onRampCurrency = 'ARBITRUM_ETH',
  rampNetworkApiKey = '7t45dxm7yhho7fr9u4b9k8nv9gvczansfu8zt9pm', // staging
  onRampAvailable = false,
}: CapsuleModalProps) => {
  const resolvedTheme = typeof theme === 'string' ? themeResolve[theme] : theme;
  const [email, setEmail] = useState(capsule.getEmail());
  const [paillierGenDone, setPaillierGenDone] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [webAuthURLForLogin, setWebAuthURLForLogin] = useState('');
  const [isCreateAccountType, setIsCreateAccountType] = useState(false);
  const [distributeDone, setDistributeDone] = useState(false);
  const [isFullyLoggedIn, setIsFullyLoggedIn] = useState(false);
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  const [currentStep, setCurrentStep] = useState(ModalStep.EMAIL_COLLECTION);
  const [createWalletRes, setCreateWalletRes] =
    useState<[Wallet, string]>(null);
  const [recoveryShare, setRecoveryShare] = useState<string>(null);

  const createAccountInterval = useRef<number>();
  const loginInterval = useRef<number>();

  const [percentKeygenDone, setPercentKeygenDone] = useState(
    paillierGenDone ? 25 : 0,
  );

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(ModalStep.EMAIL_COLLECTION);
      setIsFullyLoggedIn(false);
      setDistributeDone(false);
      setIsCreateAccountType(false);
      setWebAuthURLForLogin('');
      setWebAuthURLForLogin('');
      setWebAuthURLForCreate('');
      setWalletCreated(false);
      setPercentKeygenDone(paillierGenDone ? 25 : 0);
      setCreateWalletRes(null);
      setRecoveryShare(null);
    }
  }, [isOpen]);

  // function should be called a total of 5 times
  function keygenStatusFunction() {
    setPercentKeygenDone((percentKeygenDone) => percentKeygenDone + 15);
  }

  // generate paillier secret key ahead of time
  useEffect(() => {
    // TODO probably we should invalidate it after using...
    async function genPaillierKey() {
      await capsule.generatePaillierKey();
      setPaillierGenDone(true);
      setPercentKeygenDone(25);
    }
    genPaillierKey();
  }, []);

  // generate wallet once we know it's account creation
  useEffect(() => {
    if (!isCreateAccountType || walletCreated || !paillierGenDone) {
      return;
    }
    async function genWallet() {
      const createWalletRes = await capsule.createWallet(
        true,
        keygenStatusFunction,
      );
      setCreateWalletRes(createWalletRes);
      setWalletCreated(true);
    }
    genWallet();
  }, [paillierGenDone, isCreateAccountType]);

  // distribute share once we know keygen is done
  useEffect(() => {
    if (distributeDone || !isFullyLoggedIn || !walletCreated) {
      return;
    }

    console.log('distributing...');

    async function distributeShare() {
      const result = await capsule.distributeNewWalletShare(
        createWalletRes[0].id,
        createWalletRes[0].signer,
      );
      console.log(result);
      setRecoveryShare(result);
      setDistributeDone(true);
      setCurrentStep(ModalStep.ACCOUNT_CREATION_DONE);
    }
    distributeShare();
  }, [isFullyLoggedIn, walletCreated, createWalletRes]);

  // wait for biometric to be added to move on to next step
  useEffect(() => {
    if (webAuthURLForCreate) {
      createAccountInterval.current = window.setInterval(async () => {
        if (await capsule.isSessionActive()) {
          clearInterval(createAccountInterval.current);
          setIsFullyLoggedIn(true);
          setWebAuthURLForCreate('');
          setCurrentStep(ModalStep.AWAITING_WALLET_CREATION);
        }
      }, 2000);
      return () => clearInterval(createAccountInterval.current);
    }
  }, [webAuthURLForCreate]);

  // wait for login auth to do post login setup
  useEffect(() => {
    if (webAuthURLForLogin) {
      loginInterval.current = window.setInterval(async () => {
        const isActive = await capsule.isSessionActive();
        if (!isActive) {
          return;
        }
        await capsule.userSetupAfterLogin();

        const fetchedWallets = await capsule.fetchWallets();
        const tempSharesRes = await capsule.getTransmissionKeyShares();
        // need this check for the case where user has logged in but temp encrypted shares
        // haven't been sent to the backend yet
        if (
          tempSharesRes.data.temporaryShares.length === fetchedWallets.length
        ) {
          await capsule.setupAfterLogin();
          setIsFullyLoggedIn(true);
          setWebAuthURLForLogin('');
          clearInterval(loginInterval.current);
          setCurrentStep(ModalStep.LOGIN_DONE);
          return;
        }
      }, 2000);
      return () => clearInterval(loginInterval.current);
    }
  }, [webAuthURLForLogin]);

  return (
    <ChakraProvider theme={resolvedTheme}>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          backgroundColor={'brand.background'}
          padding={10}
          maxWidth={'500px'}
          minWidth={'200px'}
        >
          <ModalBody>
            <VStack alignItems="center" width="100%">
              <EmailCollectionStep
                setWebAuthURLForLogin={setWebAuthURLForLogin}
                setCurrentStep={setCurrentStep}
                setEmail={setEmail}
                email={email}
                capsule={capsule}
                setIsCreateAccountType={setIsCreateAccountType}
                currentStep={currentStep}
              />
              <VerificationCodeStep
                setCurrentStep={setCurrentStep}
                currentStep={currentStep}
                setWebAuthURLForCreate={setWebAuthURLForCreate}
                capsule={capsule}
              />
              <BiometricCreationStep
                currentStep={currentStep}
                webAuthURLForCreate={webAuthURLForCreate}
              />
              <BiometricLoginStep
                capsule={capsule}
                currentStep={currentStep}
                webAuthURLForLogin={webAuthURLForLogin}
              />
              <AwaitingWalletCreationStep
                currentStep={currentStep}
                percentKeygenDone={percentKeygenDone}
              />
              <AccountCreationDoneStep
                currentStep={currentStep}
                recoveryShare={recoveryShare}
                email={email}
                defaultAsset={onRampCurrency}
                onRampAvailable={onRampAvailable}
                capsule={capsule}
                onClose={onClose}
                rampNetworkApiKey={rampNetworkApiKey}
              />
              <LoginDoneStep currentStep={currentStep} />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};
