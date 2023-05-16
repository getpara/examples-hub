import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ChakraProvider,
  Container,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Heading,
  useDisclosure,
  HStack,
  Image,
  Flex,
} from '@chakra-ui/react';
import capsule from './capsule';
import { distributeNewShare } from './library/shares/shareDistribution';
import { KeyContainer } from './library/shares/KeyContainer';
import { EncryptorType, KeyType } from '@usecapsule/user-management-client';
import SingleInputModal from './singleInputModal';
import SetUpBiometricsModal from './setUpBiometricsModal';
import FinalModal, { ModalState, ModalStateType } from './FinalModal';
import theme from './theme';

export function useIsSemiLoggedIn() {
  const interval = useRef<number>();
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    interval.current = window.setInterval(async () => {
      try {
        const {
          data: { userId },
          // @ts-ignore
        } = await capsule.ctx.capsuleClient.touchSession();
        setUserId(userId);
      } catch (e) {
        setUserId(null);
      }
    }, 1000);
    return () => clearInterval(interval.current);
  }, []);
  return !!userId;
}

export function useIsFullyLoggedIn() {
  const interval = useRef<number>();
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    interval.current = window.setInterval(async () => {
      setIsSessionActive(await capsule.isSessionActive());
    }, 1000);
    return () => clearInterval(interval.current);
  }, []);
  return isSessionActive;
}

async function recoverUserShare(serializedRecoveryShare: string) {
  const recoveryPrivateKeyContainer = KeyContainer.import(
    serializedRecoveryShare,
  );

  // @ts-ignore
  const res = await capsule.ctx.capsuleClient.getKeyshare(
    // @ts-ignore
    capsule.userId,
    recoveryPrivateKeyContainer.walletId,
    KeyType.USER,
    EncryptorType.RECOVERY,
  );

  return recoveryPrivateKeyContainer.decrypt(res.data.keyShare.encryptedShare);
}

export default function App() {
  const [email, setEmail] = useState(capsule.getEmail());
  const [verificationCode, setVerificationCode] = useState('');
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');

  const [recoveryShare, setRecoveryShare] = useState('');
  const [userShare, setUserShare] = useState('');
  const [userId, setUserId] = useState();
  // @ts-ignore
  const isSemiLoggedIn = useIsSemiLoggedIn() && !!userId;
  console.log(isSemiLoggedIn);

  const isSessionActive = useIsFullyLoggedIn();

  /// TODO REMOVE ME
  const [loginAttemptedSessionId, updateLoginAttemptedSessionId] =
    useState(null);
  const [loginEncryptionKeyPair, setLoginEncryptionKeyPair] = useState(null);
  const [loginEncryptPublicKey, setLoginEncryptionPublicKey] = useState('');
  const webURLForLogin = loginAttemptedSessionId
    ? // @ts-ignore
      capsule.getWebAuthURLForLogin(
        loginAttemptedSessionId,
        loginEncryptPublicKey,
      )
    : '';
  //// END REMOVE ME

  const handleRecoveryChange = (event) => {
    setRecoveryShare(event.target.value);
  };

  const {
    isOpen: isOpenLoginModal,
    onOpen: onOpenLoginModal,
    onClose: onCloseLoginModal,
  } = useDisclosure();

  const {
    isOpen: isOpenVerifyModal,
    onOpen: onOpenVerifyModal,
    onClose: onCloseVerifyModal,
  } = useDisclosure();

  const {
    isOpen: isOpenSetUpBiometricsModal,
    onOpen: onOpenSetUpBiometricsModal,
    onClose: onCloseSetUpBiometricsModal,
  } = useDisclosure();

  const {
    isOpen: isOpenFinalModal,
    onOpen: onOpenFinalModal,
    onClose: onCloseFinalModal,
  } = useDisclosure();

  const [loadingState, setLoadingState] = useState<ModalStateType>(
    ModalState.Success,
  );

  const distribute = useCallback(async () => {
    try {
      const { walletId } = KeyContainer.import(recoveryShare);
      const res = await distributeNewShare(
        // @ts-ignore
        capsule.ctx,
        // @ts-ignore
        capsule.userId,
        walletId,
        userShare,
        true,
      );
      console.log(res);
      setLoadingState(ModalState.Success);
    } catch (e) {
      setLoadingState(ModalState.Failure);
    }
  }, [userShare, recoveryShare]);

  useEffect(() => {
    if (isOpenSetUpBiometricsModal && isSessionActive) {
      onCloseSetUpBiometricsModal();
      setLoadingState(ModalState.Loading);
      onOpenFinalModal();
      console.log('CONTINUE');
      distribute();
    }
  }, [isSessionActive, isOpenSetUpBiometricsModal]);

  console.log({ isSessionActive, isOpenSetUpBiometricsModal });

  // @ts-ignore
  return (
    <ChakraProvider theme={theme}>
      <FinalModal
        isOpen={isOpenFinalModal}
        onClose={onCloseFinalModal}
        state={loadingState}
      />
      <SingleInputModal
        onClose={onCloseLoginModal}
        isOpen={isOpenLoginModal}
        value={email}
        onValue={setEmail}
        placeholder={'Enter email address'}
        action={'Proceed'}
        title={'Login'}
        label={'Email'}
        onAction={async () => {
          console.log(email);
          // @ts-ignore
          await capsule.ctx.capsuleClient.recoveryInit(email);
          // @ts-ignore
          capsule.email = email;
          onOpenVerifyModal();
        }}
      />
      <SingleInputModal
        onClose={onCloseVerifyModal}
        isOpen={isOpenVerifyModal}
        value={verificationCode}
        onValue={setVerificationCode}
        placeholder={'000000'}
        action={'Verify'}
        title={'Verification'}
        label={'Verification code'}
        onAction={async () => {
          const {
            data: { userId },
            // @ts-ignore
          } = await capsule.ctx.capsuleClient.recoveryVerification(
            email,
            '123456',
          );
          console.log(userId);
          // @ts-ignore
          capsule.userId = userId;
          setUserId(userId);
        }}
      />

      <SetUpBiometricsModal
        onClose={onCloseSetUpBiometricsModal}
        url={webAuthURLForCreate}
        isOpen={isOpenSetUpBiometricsModal}
      />

      <Container maxW="ld" padding={10}>
        <VStack align="right" spacing={5}>
          <HStack justifyContent={'right'}>
            <Button
              colorScheme="blue"
              onClick={onOpenLoginModal}
              isDisabled={isSemiLoggedIn}
            >
              Login
            </Button>
            <Button
              isDisabled={!isSemiLoggedIn}
              colorScheme="red"
              onClick={async () => {
                await capsule.logout();
                capsule.clearStorage();
                location.reload();
              }}
            >
              Logout
            </Button>
          </HStack>

          <Flex alignItems="center" justifyContent="left" mb={12}>
            <Image
              src="/wordmark_white.svg"
              alt="Logo"
              width="50%"
              maxWidth="300px"
              marginRight={2}
              marginBottom={12}
            />
          </Flex>
          <Flex alignItems="center" justifyContent="center" mb={12}>
            <Card
              align="center"
              height="360"
              width={'50%'}
              maxWidth={800}
              backgroundColor={'gray.700'}
            >
              <CardHeader>
                <Heading size="md" color="gray.300">
                  {' '}
                  Enter Recovery Share{' '}
                </Heading>
              </CardHeader>

              <CardBody height="200" overflow="scroll" width="100%">
                <Textarea
                  isDisabled={!isSemiLoggedIn}
                  fontFamily="monospace"
                  height={200}
                  color="gray.300"
                  wordBreak="break-all"
                  onChange={handleRecoveryChange}
                />
              </CardBody>
              <Button
                isDisabled={!isSemiLoggedIn}
                colorScheme="blue"
                marginBottom={4}
                onClick={async () => {
                  const userShare = await recoverUserShare(recoveryShare);
                  console.log(userShare);
                  setUserShare(userShare);
                  const link = await capsule.getSetUpBiometricsURL();
                  console.log(link);
                  setWebAuthURLForCreate(link);
                  onOpenSetUpBiometricsModal();

                  console.log(webAuthURLForCreate);
                }}
              >
                Recover
              </Button>
            </Card>
          </Flex>

          {/* REMOVE ME */}
          {/*<Button*/}
          {/*  onClick={async () => {*/}
          {/*    // @ts-ignore*/}
          {/*    const res = await capsule.ctx.capsuleClient.touchSession(true);*/}
          {/*    if (!loginEncryptionKeyPair) {*/}
          {/*      const keyPair = await getAsymmetricKeyPair();*/}
          {/*      setLoginEncryptionKeyPair(keyPair);*/}
          {/*      setLoginEncryptionPublicKey(getPublicKeyHex(keyPair));*/}
          {/*    }*/}
          {/*    updateLoginAttemptedSessionId(res.data.sessionId);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  REGULAR Login TEMPORARY*/}
          {/*</Button>*/}
          {/*{webURLForLogin && (*/}
          {/*  <a href={webURLForLogin} rel="noreferrer" target="_blank">*/}
          {/*    <QRCode value={webURLForLogin} />*/}
          {/*  </a>*/}
          {/*)}*/}
        </VStack>
      </Container>
    </ChakraProvider>
  );
}
