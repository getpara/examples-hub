import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  ChakraProvider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Theme,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { ModalStep, ModalStepNumber } from './steps';
import { EmailCollectionStep } from './EmailCollectionStep';
import { BiometricLoginStep } from './BiometricLoginStep';
import { AwaitingWalletCreationStep } from './AwaitingWalletCreationStep';
import { AccountCreationDoneStep } from './AccountCreationDoneStep';
import { LoginDoneStep } from './LoginDoneStep';
import { BiometricCreationStep } from './BiometricCreationStep';
import { VerificationCodeStep } from './VerificationCodeStep';
import { darkTheme, lightTheme, newTheme } from './theme';
import { Capsule, Wallet } from '../Capsule';
import CapsuleSmall from './assets/capsuleSmall';
import { Header } from './Header';
import { Footer } from './Footer';
import { truncateEthAddress } from './utils';
import { Setup2FA } from './Setup2FA';
import { CoreCapsule } from '../CoreCapsule';
import { RecoverySecretStep } from './RecoverySecretStep';
import './css/modal.css'
import FlowContext from './FlowContext';

interface CapsuleModalProps {
  capsule: Capsule | CoreCapsule;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light' | any;
  onRampCurrency?: string;
  onRampAvailable?: boolean;
  rampNetworkApiKey?: string;
  appName: string;
}

const themeResolve: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
} as const;

const POLLING_INTERVAL_MS = 2000;
const STORAGE_PREFIX = '@CAPSULE/';

export const CapsuleModal = ({
  capsule,
  isOpen,
  onClose,
  theme = 'dark',
  appName,
  onRampCurrency = 'ARBITRUM_ETH',
  rampNetworkApiKey = '7t45dxm7yhho7fr9u4b9k8nv9gvczansfu8zt9pm', // staging
  onRampAvailable = false,
}: CapsuleModalProps) => {
  const resolvedTheme = typeof theme === 'string' ? themeResolve[theme] : theme;
  const [email, setEmail] = useState(capsule.getEmail());
  const [walletCreated, setWalletCreated] = useState(false);
  const [walletCreationInProgress, setWalletCreationInProgress] = useState(false);
  const [webAuthURLForLogin, setWebAuthURLForLoginState] = useState(sessionStorage.getItem(`${STORAGE_PREFIX}webAuthURLForLogin`) || '');
  const setWebAuthURLForLogin = (value: string) => {
    setWebAuthURLForLoginState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}webAuthURLForLogin`, value);
  };
  const [isCreateAccountType, setIsCreateAccountTypeState] = useState(sessionStorage.getItem(`${STORAGE_PREFIX}isCreateAccountType`) === 'true');
  const setIsCreateAccountType = (value: boolean) => {
    setIsCreateAccountTypeState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}isCreateAccountType`, value.toString());
  };
  const [distributeDone, setDistributeDone] = useState(false);
  const [isFullyLoggedIn, setIsFullyLoggedInState] = useState(sessionStorage.getItem(`${STORAGE_PREFIX}isFullyLoggedIn`) === 'true');
  const setIsFullyLoggedIn = (value: boolean) => {
    setIsFullyLoggedInState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}isFullyLoggedIn`, value.toString());
  };
  const [webAuthURLForCreate, setWebAuthURLForCreateState] = useState(sessionStorage.getItem(`${STORAGE_PREFIX}webAuthURLForCreate`) || '');
  const setWebAuthURLForCreate = (value: string) => {
    setWebAuthURLForCreateState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}webAuthURLForCreate`, value);
  };
  const [currentStep, setCurrentStepState] = useState(sessionStorage.getItem(`${STORAGE_PREFIX}currentStep`) as ModalStep || ModalStep.EMAIL_COLLECTION);
  const setCurrentStep = (value: ModalStep) => {
    setCurrentStepState(value);
    sessionStorage.setItem(`${STORAGE_PREFIX}currentStep`, value);
  };
  const [createWalletRes, setCreateWalletRes] =
    useState<[Wallet, string]>(null);
  const [recoveryShare, setRecoveryShare] = useState<string>(null);

  const createAccountTimeout = useRef<number>();
  const loginTimeout = useRef<number>();

  const [percentKeygenDone, setPercentKeygenDone] = useState(0);

  const [isLogin, setIsLogin] = useState(false);

  const is2FASetup = async () => {
    try {
      const { isSetup } = await capsule.check2FAStatus();
      return isSetup;
    } catch (error) {
      console.error('An error occurred while checking 2FA:', error);
      return false; 
    }
  };

  useEffect(() => {
    if (!isOpen && [ModalStep.LOGIN_DONE, ModalStep.ACCOUNT_CREATION_DONE].includes(currentStep)) {
      setCurrentStep(ModalStep.EMAIL_COLLECTION);
      setIsFullyLoggedIn(false);
      setDistributeDone(false);
      setIsCreateAccountType(false);
      setWebAuthURLForLogin('');
      setWebAuthURLForLogin('');
      setWebAuthURLForCreate('');
      setWalletCreated(false);
      setPercentKeygenDone(0);
      setCreateWalletRes(null);
      setRecoveryShare(null);
    }
  }, [isOpen]);

  // function should be called a total of 5 times
  function keygenStatusFunction() {
    setPercentKeygenDone((percentKeygenDone) => percentKeygenDone + 15);
  }


  // generate wallet once we know it's account creation
  useEffect(() => {
    if (
      (!isCreateAccountType && currentStep !== ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN) ||
      walletCreated ||
      walletCreationInProgress
    ) {
      return;
    }
    async function genWallet() {
      setWalletCreationInProgress(true);
      const createWalletRes = await capsule.createWallet(
        true,
        keygenStatusFunction,
      );
      setCreateWalletRes(createWalletRes);
      setWalletCreated(true);
      setWalletCreationInProgress(false);
    }
    genWallet();
  }, [isCreateAccountType, currentStep]);

  // distribute share once we know keygen is done
  useEffect(() => {
    if (distributeDone || !isFullyLoggedIn || !walletCreated) {
      return;
    }

    async function distributeShare() {
      const result = await capsule.distributeNewWalletShare(
        createWalletRes[0].id,
        createWalletRes[0].signer,
      );
      setRecoveryShare(result);
      setDistributeDone(true);
      if (currentStep === ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN) {
        if (await is2FASetup()) {
          setCurrentStep(ModalStep.LOGIN_DONE);
        } else {
          setCurrentStep(ModalStep.SETUP_2FA);
        }
      } else {
        setCurrentStep(ModalStep.SECRET);
      }
    }
    distributeShare();
  }, [isFullyLoggedIn, walletCreated, createWalletRes]);

  async function awaitWalletCreationTransition(): Promise<void> {
    if (capsule instanceof CoreCapsule) {
      await capsule.waitForAccountCreation();

      setIsFullyLoggedIn(true);
      setWebAuthURLForCreate('');
      setCurrentStep(ModalStep.AWAITING_WALLET_CREATION);
      return;
    }
    try {
      if (await capsule.isSessionActive()) {
        setIsFullyLoggedIn(true);
        setWebAuthURLForCreate('');
        setCurrentStep(ModalStep.AWAITING_WALLET_CREATION);
        return;
      }
    } catch (err) {
      // want to continue polling on error and still set timeout
      console.error(err);
    }
    createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, POLLING_INTERVAL_MS);
  }

  // wait for biometric to be added to move on to next step
  useEffect(() => {
    if (webAuthURLForCreate) {
      createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, POLLING_INTERVAL_MS);
    }
    return () => clearTimeout(createAccountTimeout.current);
  }, [webAuthURLForCreate]);

  async function awaitLoginTransition(): Promise<void> {
    if (capsule instanceof CoreCapsule) {
      const { needsWallet } = await capsule.waitForLoginAndSetup();

      setIsFullyLoggedIn(true);
      setWebAuthURLForLogin('');

      if (needsWallet) {
        setCurrentStep(ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN);
      } else {
        if (await is2FASetup()) {
          setCurrentStep(ModalStep.LOGIN_DONE);
        } else {
          setCurrentStep(ModalStep.SETUP_2FA);
        }
      }
      return
    }
    try {
      const isActive = await capsule.isSessionActive();
      if (!isActive) {
        loginTimeout.current = window.setTimeout(awaitLoginTransition, POLLING_INTERVAL_MS);
        return;
      }
      await capsule.userSetupAfterLogin();

      const fetchedWallets = (await capsule.fetchWallets()).filter(
        wallet => !!wallet.address,
      );
      const tempSharesRes = await capsule.getTransmissionKeyShares();
      // need this check for the case where user has logged in but temp encrypted shares
      // haven't been sent to the backend yet
      if (
        tempSharesRes.data.temporaryShares.length === fetchedWallets.length
      ) {
        await capsule.setupAfterLogin(tempSharesRes.data.temporaryShares);
        setIsFullyLoggedIn(true);
        setWebAuthURLForLogin('');

        if (Object.values(capsule.getWallets()).length === 0) {
          setCurrentStep(ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN);
          return;
        }
        if (await is2FASetup()) {
          setCurrentStep(ModalStep.LOGIN_DONE);
        } else {
          setCurrentStep(ModalStep.SETUP_2FA);
        }
        return;
      }
    } catch (err) {
      // want to continue polling on error and still set timeout
      console.error(err);
    }
    loginTimeout.current = window.setTimeout(awaitLoginTransition, POLLING_INTERVAL_MS);
  }

  // wait for login auth to do post login setup
  useEffect(() => {
    if (webAuthURLForLogin) {
      loginTimeout.current = window.setTimeout(awaitLoginTransition, POLLING_INTERVAL_MS);
    }
    return () => clearTimeout(loginTimeout.current);
  }, [webAuthURLForLogin]);

  return (
    <FlowContext.Provider value={{ isLogin, setIsLogin }}>
      <ChakraProvider theme={resolvedTheme}>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          {/* 
            // @ts-ignore */}
          <ModalContent
            backgroundColor={'brand.background'}
            width="356px"
            height="632px"
          >
            {/* 
          // @ts-ignore */}
            <ModalBody padding={0} display="flex" flexDirection="column">
              <Header step={ModalStepNumber[currentStep]} onClose={onClose} />
              <VStack
                alignItems="center"
                display="flex"
                flex={1}
                margin="22px 22px 0px"
                className='font-hanken'
              >
                <EmailCollectionStep
                  setWebAuthURLForLogin={setWebAuthURLForLogin}
                  setCurrentStep={setCurrentStep}
                  setEmail={setEmail}
                  email={email}
                  capsule={capsule}
                  setIsCreateAccountType={setIsCreateAccountType}
                  currentStep={currentStep}
                  appName={appName}
                />
                <VerificationCodeStep
                  setCurrentStep={setCurrentStep}
                  currentStep={currentStep}
                  setWebAuthURLForCreate={setWebAuthURLForCreate}
                  capsule={capsule}
                  email={email}
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
                  appName={appName}
                  onClose={onClose}
                  capsule={capsule}
                  rampNetworkApiKey={rampNetworkApiKey}
                  defaultAsset={onRampCurrency}
                  onRampAvailable={onRampAvailable}
                />
                <RecoverySecretStep 
                  recoveryShare={recoveryShare}
                  currentStep={currentStep}
                  email={email}
                  setCurrentStep={setCurrentStep}
                />
                {currentStep === ModalStep.LOGIN_DONE && <LoginDoneStep
                  onClose={onClose}
                  appName={appName}
                />}
                {currentStep === ModalStep.SETUP_2FA && <Setup2FA
                  setCurrentStep={setCurrentStep}
                  capsule={capsule as Capsule}
                />}
              </VStack>
              <Footer />
            </ModalBody>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </FlowContext.Provider>
  );
};

function Helper() {
  return (
    <Box
      w="300px"
      h="158px"
      backgroundColor="brand.background"
      padding="18px"
      display={'flex'}
      flexDirection={'column'}
    >
      <Text fontSize="18px" color="brand.content">
        What is Connect?
      </Text>
      <HStack flex={1}>
        <Box width="60px">
          <CapsuleSmall w={27} h={48} />
        </Box>
        <Flex flexDirection="column" alignItems="left" justifyContent="center">
          <Text fontSize="xs" color="brand.content">
            A New Way to Log In
          </Text>
          <Text fontSize="xs" color="brand.dimmed2">
            Get started and create a wallet or log in, powered by Capsule.
          </Text>
        </Flex>
      </HStack>
    </Box>
  );
}

export function CapsuleButton({
  capsule,
  appName,
}: {
  capsule: Capsule | CoreCapsule;
  appName: string;
}) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [address, setAddress] = useState(
    Object.values(capsule.getWallets())?.[0]?.address,
  );
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    async function checkSession() {
      setIsSessionActive(await capsule.isSessionActive());
    }
    checkSession();
  }, []);

  return (
    <ChakraProvider theme={newTheme}>
      <CapsuleModal
        appName={appName}
        isOpen={modalIsOpen}
        onClose={async () => {
          if (await capsule.isSessionActive()) {
            const newAddress = Object.values(capsule.getWallets())?.[0]?.address;
            setAddress(newAddress);
            setIsSessionActive(true);
          }
          setModalIsOpen(false);
        }}
        theme={newTheme}
        capsule={capsule}
      />
      <HStack>
        {(isSessionActive && address) ? (
          <Text textColor={'brand.addressColor'}>
            {truncateEthAddress(address)}
          </Text>
        ) : null}
        {/* 
          // @ts-ignore */}
        <Tooltip
          isDisabled={!!(isSessionActive && address)}
          label={<Helper />}
          backgroundColor={'brand.background'}
          borderRadius="4px"
        >
          <Button
            width={'163px'}
            height={'50px'}
            backgroundColor={'brand.background'}
            color={'white'}
            onClick={() => {
              if (isSessionActive && address) {
                capsule.logout().then(() => {
                  setAddress(undefined);
                  setIsSessionActive(false);
                });
              } else {
                setModalIsOpen(true);
              }
            }}
          >
            <Text size="18px" marginRight="9px">
              {(isSessionActive && address) ? 'Logout' : 'Connect'}
            </Text>
            <CapsuleSmall />
          </Button>
        </Tooltip>
      </HStack>
    </ChakraProvider>
  );
}
