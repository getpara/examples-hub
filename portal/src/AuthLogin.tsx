import { Buffer } from 'buffer';
global.Buffer = Buffer;
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Heading,
  Image,
  Button,
  Container,
  Text,
  Flex,
  ChakraProvider,
  Box,
  useClipboard,
  Link,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';

import { generateSignature } from './library/cryptography/webAuth';
import {
  encryptWithDerivedPublicKey,
  getDerivedPrivateKeyAndDecrypt,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from './library/cryptography/utils';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { getPartnerTheme } from './theme';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import { ENV } from './definitions';
import PoweredByCapsule from './assets/poweredByCapsule';
import { validateColorInput } from './validation';
import Copy from './assets/copy';

// anticipating that we will need to add more steps to the add device flow so using enum
// instead of just a boolean for this
enum AddDeviceFlowStep {
  PERFORM_EXISTING_LOGIN = 'PERFORM_EXISTING_LOGIN',
}

const SESSION_STORAGE_ADD_DEVICE_FLOW_STEP = '@CAPSULE/addDeviceFlowStep';

export async function authLogin(
  email: string,
  sessionLookupId: string,
  encryptionKey: string,
  newDeviceSessionLookupId?: string,
  newDeviceEncryptionKey?: string,
): Promise<string> {
  // @ts-ignore
  const { data } = await capsule.ctx.capsuleClient.getWebChallenge(
    encodeURIComponent(email),
  );
  const sig = await generateSignature(ENV, data.challenge, data.allowedPublicKeys);
  // @ts-ignore
  const verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge({
    signature: sig.response,
    publicKey: sig.id,
    email,
    sessionLookupId,
    newDeviceSessionLookupId,
  });
  const userId = verifyRes.data.userId;

  const encryptedSharesRes =
    // @ts-ignore
    await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, sig.id);
  // keyShares undefined or empty array
  if (!encryptedSharesRes.data.keyShares?.length) {
    return;
  }
  const decryptedShares = await getDerivedPrivateKeyAndDecrypt(
    // @ts-ignore
    capsule.ctx,
    sig.response.userHandle,
    encryptedSharesRes.data.keyShares,
  );
  const tempShareOpts = decryptedShares.flatMap((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(encryptionKey, share.signer);
    const opts = [{
      walletId: share.walletId,
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
      sessionLookupId,
    }];

    if (newDeviceSessionLookupId) {
      const { encryptedMessageHex: newMessageHex, encryptedKeyHex: newKeyHex } =
        encryptWithDerivedPublicKey(newDeviceEncryptionKey, share.signer);
      opts.push({
        walletId: share.walletId,
        encryptedShare: newMessageHex,
        encryptedKey: newKeyHex,
        sessionLookupId: `${newDeviceSessionLookupId}-new-device`,
      });
    }

    return opts;
  });
  // @ts-ignore
  await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(
    userId,
    tempShareOpts,
  );
  return userId;
}

function AuthLogin() {
  const [loginDone, updateLoginDone] = useState(false);
  const [userId, setUserId] = useState('');
  const [partner, setPartner] = useState<Partner | undefined>();
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [basePortalURL, setBasePortalURL] = useState<string | undefined>();
  const [addDeviceFlowStep, setAddDeviceFlowStepState] = useState<string | undefined>(
    sessionStorage.getItem(SESSION_STORAGE_ADD_DEVICE_FLOW_STEP) as AddDeviceFlowStep | undefined,
  );
  function setAddDeviceFlowStep(step: AddDeviceFlowStep) {
    setAddDeviceFlowStepState(step);
    sessionStorage.setItem(SESSION_STORAGE_ADD_DEVICE_FLOW_STEP, step);
  }

  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const encryptionKey = searchParams.get('encryptionKey');
  const sessionId = searchParams.get('sessionId');
  const newDeviceSessionLookupId = searchParams.get('newDeviceSessionId') || undefined;
  const newDeviceEncryptionKey = searchParams.get('newDeviceEncryptionKey') || undefined;

  const paramsPartnerId = searchParams.get('partnerId');
  const portalBackgroundColor = validateColorInput(searchParams.get('portalBackgroundColor')) ?
    decodeURIComponent(searchParams.get('portalBackgroundColor')) :
    undefined;
  const portalPrimaryButtonColor = validateColorInput(searchParams.get('portalPrimaryButtonColor')) ?
    decodeURIComponent(searchParams.get('portalPrimaryButtonColor')) :
    undefined;
  const portalTextColor = validateColorInput(searchParams.get('portalTextColor')) ?
    decodeURIComponent(searchParams.get('portalTextColor')) :
    undefined;

  const login = useCallback(() => {
    authLogin(paramsEmail, sessionId, encryptionKey, newDeviceSessionLookupId, newDeviceEncryptionKey).then((userId: string) => {
      updateLoginDone(true);
      setUserId(userId);
      if (!paramsPartnerId || !partner?.policiesEnabled) {
        setTimeout(function () {
          window.close();
        }, 200);
      }
    });
  }, [paramsEmail, sessionId, encryptionKey, newDeviceSessionLookupId, newDeviceEncryptionKey]);

  const addThisDevice = () => {
    setAddDeviceFlowStep(AddDeviceFlowStep.PERFORM_EXISTING_LOGIN);
  };

  // maybe show some text somewhere before closing
  const onPermissionsDone = () => {
    setTimeout(function () {
      window.close();
    }, 200);
  };

  const { onCopy, setValue: setClipboardValue, hasCopied } = useClipboard('');

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (await userManagementClient.getPartner(paramsPartnerId)).data;
        setPartner(detailsRes.partner);
      }
    }
    getPartner();
  }, []);

  // add try-catch for all timeout stuff and set timeout again on error
  useEffect(() => {
    async function getTemporaryShares() {
      try {
        const isActive = await capsule.isSessionActive();
        if (!isActive) {
          window.setTimeout(getTemporaryShares, 2000);
          return;
        }
        const touchRes = await userManagementClient.touchSession();
        await capsule.setUserId(touchRes.data.userId);
        const fetchedWallets = (await capsule.fetchWallets()).filter(
          wallet => !!wallet.address,
        );
        const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;

        if (temporaryShares.length === fetchedWallets.length) {
          const authCreationURL = await capsule.getSetUpBiometricsURL(true);
          window.location.href = authCreationURL;
          return;
        }

        window.setTimeout(getTemporaryShares, 2000);
      } catch (e) {
        console.error(e);
        window.setTimeout(getTemporaryShares, 2000);
      }
    }
    async function getWebAuthURLForAddDevice() {
      capsule.portalBackgroundColor = portalBackgroundColor;
      capsule.portalPrimaryButtonColor = portalPrimaryButtonColor;
      capsule.portalTextColor = portalTextColor;
  
      await capsule.setEmail(paramsEmail);
      const touchRes = await userManagementClient.touchSession();
      if (!capsule.loginEncryptionKeyPair) {
        const keyPair = await getAsymmetricKeyPair(capsule.ctx);
        await capsule.setLoginEncryptionKeyPair(keyPair);
      }

      const url = await capsule.getWebAuthURLForLogin(
        sessionId,
        encryptionKey,
        paramsPartnerId,
        touchRes.data.sessionLookupId,
        getPublicKeyHex(capsule.loginEncryptionKeyPair),
      );
      const shortUrl = await capsule.shortenLoginLink(url);
      setUrlForNewDeviceLogin(shortUrl);
      setClipboardValue(shortUrl);
    }
    async function getPortalURL() {
      const portalURL = await capsule.getPortalURL();
      setBasePortalURL(portalURL);
    }

    if (!newDeviceSessionLookupId && (addDeviceFlowStep === AddDeviceFlowStep.PERFORM_EXISTING_LOGIN)) {
      getPortalURL();
      getWebAuthURLForAddDevice();
      window.setTimeout(getTemporaryShares, 2000);
    }
  }, [addDeviceFlowStep]);

  if (addDeviceFlowStep === AddDeviceFlowStep.PERFORM_EXISTING_LOGIN) {
    return (paramsPartnerId && !partner) ? undefined : (urlForNewDeviceLogin && (
      <ChakraProvider theme={getPartnerTheme(portalBackgroundColor, portalPrimaryButtonColor, portalTextColor)}>
        <Container color="white" maxW="ld" padding={10}>
          <Flex alignItems="center" justifyContent="left" mb="10%">
            <Image
              src={partner?.portalHeaderLogoUrl || '/wordmark_white.svg'}
              alt="Logo"
            />
          </Flex>
          <Heading fontSize="4vh" mb="10%">
            Add Device
          </Heading>
          <Text mb={8}>We see you've already set up Capsule on another device</Text>
          <Text mb={8}>Please log in to Capsule on your other device by scanning this QR code</Text>

          <Flex justifyContent="center">
            <QRCode value={urlForNewDeviceLogin}/>
          </Flex>
          <Text align="center" marginTop={3} mb={8}>Or copy <Link isExternal href={urlForNewDeviceLogin} textDecoration="underline">this link</Link>
            <Button marginLeft={2} h="38px" onClick={onCopy} size="sm">
              <Box position="absolute">
                <Copy />
              </Box>
            </Button>
            {hasCopied ? ' Link Copied!' : undefined}
          </Text>
          <Text>
            If you are unable to log in to any existing devices, you will need to recover your account.{' '}
            <Link href={basePortalURL} textDecoration="underline">Recover My Account</Link>
          </Text>
        </Container>
        {paramsPartnerId && <Box backgroundColor={portalBackgroundColor} height="62px" width="100%">
          <Flex backgroundColor={portalBackgroundColor} h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
            <PoweredByCapsule color={portalTextColor} w={50} h={20} />
          </Flex>
        </Box>}
      </ChakraProvider>
    ));
  }

  return (paramsPartnerId && !partner) ? undefined : (
    <ChakraProvider theme={getPartnerTheme(portalBackgroundColor, portalPrimaryButtonColor, portalTextColor)}>
      <Container color="white" maxW="ld" padding={10}>
        {/* if first time logging into app, then need to accept scopes */}
        <Flex alignItems="center" justifyContent="left" mb={12}>
          <Image
            src={partner?.portalHeaderLogoUrl || '/wordmark_white.svg'}
            alt="Logo"
            width="50%"
            maxWidth={300}
            marginRight={2}
          />
        </Flex>
        {loginDone && paramsPartnerId && partner?.policiesEnabled && (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={userId}
            partnerId={paramsPartnerId}
            isLogin
          ></PermissionSelection>
        )}
        <Heading fontSize="4vh" mb="10%">
          {newDeviceSessionLookupId ? 'Login to Authenticate New Device' : 'Login Portal'}
        </Heading>
        <Text fontSize="2.5vh" mb="10%">
          {newDeviceSessionLookupId ?
            'It looks like you\'re trying to add Capsule to a new device.' :
            'Authenticate with Capsule to create your wallet.'}
        </Text>
        {!newDeviceSessionLookupId && <Text fontSize="2.5vh" mb="10%">
          If you've previously logged in on a different device, or there is an error finding your key on this device,
          you should select <strong>Add This Device</strong> below.
        </Text>}
        {newDeviceSessionLookupId ? <Text fontSize="2.5vh" mb="10%">
          If you would like to proceed with this action, please complete login below.
          Otherwise, please close this window and disregard this message.
        </Text> :
        <Text fontSize="2.5vh" mb="10%">
          We're using your device to safely store your wallet for use across
          web3. Don't worry, Capsule never collects or stores this information,
          it is only used to save your wallet to your device.
          <a href="https://docs.usecapsule.com/" target='_blank' rel='noreferrer'>
            {' '}
            <u>Learn More</u>
          </a>
        </Text>}

        <Container width="100%" display="flex" justifyContent="center" mb="5%">
          <Button
            colorScheme="green"
            onClick={login}
            p="2.5vh"
            fontSize="2.5vh"
            maxWidth="50%"
            alignSelf={'center'}
          >
            {loginDone ? 'Success!' : 'Login'}
          </Button>
        </Container>
        {!newDeviceSessionLookupId && <Container width="100%" display="flex" justifyContent="center" padding={3}>
          <Button
            style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            onClick={addThisDevice}
            p="2.5vh"
            fontSize="2.5vh"
            maxWidth="50%"
            alignSelf={'center'}
          >
            <u>Add This Device</u>
          </Button>
        </Container>}

        {loginDone ? (
          <Text color={portalTextColor || "green"} size="lg">
            Login Complete. You can close this window if it does not automatically redirect...
          </Text>
        ) : null}
      </Container>
      {paramsPartnerId && <Box backgroundColor={portalBackgroundColor} height="62px" width="100%">
        <Flex backgroundColor={portalBackgroundColor} h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
          <PoweredByCapsule color={portalTextColor} w={50} h={20} />
        </Flex>
      </Box>}
    </ChakraProvider>
  );
}

export default AuthLogin;
