import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Heading,
  Image,
  Button,
  Text,
  Flex,
  Box,
  useClipboard,
  Link,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';

import {
  generateSignature,
  encryptWithDerivedPublicKey,
  getDerivedPrivateKeyAndDecrypt,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from '@usecapsule/react-sdk';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import { ENV } from './definitions';
import { validateColorInput } from './validation';
import CopyButton from './assets/CopyButton/CopyButton';
import { PortalModalWrapper } from './assets/modalComponents/PortalModalWrapper';
import { ModalButton } from './assets/modalComponents/ModalButton';

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
  const data = await capsule.ctx.capsuleClient.getWebChallenge(
    encodeURIComponent(email),
  );
  const sig = await generateSignature(
    ENV,
    data.challenge,
    data.allowedPublicKeys,
  );
  const userHandle = sig.response.userHandle;
  delete sig.response.userHandle;

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
    userHandle,
    encryptedSharesRes.data.keyShares,
  );
  const tempShareOpts = decryptedShares.flatMap((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(encryptionKey, share.signer);
    const opts = [
      {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        sessionLookupId,
      },
    ];

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
  const [clipboardValue, setClipboardValue] = useState('');
  const [loginDone, updateLoginDone] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [partner, setPartner] = useState<Partner | undefined>();
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [basePortalURL, setBasePortalURL] = useState<string | undefined>();
  const [addDeviceFlowStep, setAddDeviceFlowStepState] = useState<
    string | undefined
  >(
    sessionStorage.getItem(SESSION_STORAGE_ADD_DEVICE_FLOW_STEP) as
      | AddDeviceFlowStep
      | undefined,
  );
  function setAddDeviceFlowStep(step: AddDeviceFlowStep) {
    setAddDeviceFlowStepState(step);
    sessionStorage.setItem(SESSION_STORAGE_ADD_DEVICE_FLOW_STEP, step);
  }

  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const encryptionKey = searchParams.get('encryptionKey');
  const sessionId = searchParams.get('sessionId');
  const newDeviceSessionLookupId =
    searchParams.get('newDeviceSessionId') || undefined;
  const newDeviceEncryptionKey =
    searchParams.get('newDeviceEncryptionKey') || undefined;

  const paramsPartnerId = searchParams.get('partnerId');

  const portalBackgroundColor = validateColorInput(
    searchParams.get('portalBackgroundColor'),
  )
    ? searchParams.get('portalBackgroundColor')
    : 'white';
  const portalPrimaryButtonColor = validateColorInput(
    searchParams.get('portalPrimaryButtonColor'),
  )
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonColor'))
    : 'black';
  const portalTextColor = validateColorInput(
    searchParams.get('portalTextColor'),
  )
    ? decodeURIComponent(searchParams.get('portalTextColor'))
    : 'black';
  const portalPrimaryButtonTextColor = validateColorInput(
    searchParams.get('portalPrimaryButtonTextColor'),
  )
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonTextColor'))
    : 'white';
  const [isFire, setIsFire] = useState(false);
  const buttonText = loginDone ? 'Success!' : 'Login';

  const login = useCallback(async () => {
    setIsLoggingIn(true);
    await authLogin(
      paramsEmail,
      sessionId,
      encryptionKey,
      newDeviceSessionLookupId,
      newDeviceEncryptionKey,
    )
      .then((userId: string) => {
        updateLoginDone(true);
        setUserId(userId);
        if (!paramsPartnerId || !partner?.policiesEnabled) {
          setTimeout(function () {
            window.close();
          }, 200);
        }
      })
      .catch((e) => {
        console.error(e);
      });
    setIsLoggingIn(false);
  }, [
    paramsEmail,
    sessionId,
    encryptionKey,
    newDeviceSessionLookupId,
    newDeviceEncryptionKey,
  ]);

  const addThisDevice = () => {
    setAddDeviceFlowStep(AddDeviceFlowStep.PERFORM_EXISTING_LOGIN);
  };

  // maybe show some text somewhere before closing
  const onPermissionsDone = () => {
    setTimeout(function () {
      window.close();
    }, 200);
  };

  const { onCopy, hasCopied } = useClipboard(clipboardValue);

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (
          await userManagementClient.getPartner(paramsPartnerId)
        ).data;
        setPartner(detailsRes.partner);
        if (detailsRes.partner.name === 'fire') {
          setIsFire(true);
        }
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
          (wallet) => !!wallet.address,
        );
        const temporaryShares = (await capsule.getTransmissionKeyShares(true))
          .data.temporaryShares;

        if (temporaryShares.length === fetchedWallets.length) {
          const authCreationURL = await capsule.getSetUpBiometricsURL(true);
          setAddDeviceFlowStep(null);
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
      let touchRes = await userManagementClient.touchSession();
      if (!touchRes.data.sessionLookupId) {
        touchRes = await userManagementClient.touchSession(true);
      }
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

    if (
      !newDeviceSessionLookupId &&
      addDeviceFlowStep === AddDeviceFlowStep.PERFORM_EXISTING_LOGIN
    ) {
      getPortalURL();
      getWebAuthURLForAddDevice();
      window.setTimeout(getTemporaryShares, 2000);
    }
  }, [addDeviceFlowStep]);

  if (addDeviceFlowStep === AddDeviceFlowStep.PERFORM_EXISTING_LOGIN) {
    return paramsPartnerId && !partner
      ? undefined
      : urlForNewDeviceLogin && (
          <PortalModalWrapper
            portalBackgroundColor={portalBackgroundColor}
            portalPrimaryButtonColor={portalPrimaryButtonColor}
            portalTextColor={portalTextColor}
            paramsPartnerId={paramsPartnerId}
          >
            <>
              <Flex alignItems="center" justifyContent="center">
                <Image
                  src={partner?.portalHeaderLogoUrl || '/wordmark_black.svg'}
                  alt="Logo"
                  width="50%"
                  maxWidth={300}
                />
              </Flex>
              <Heading
                fontFamily={isFire && 'ClashDisplay'}
                textAlign="center"
                fontSize="2xl"
              >
                Add Device
              </Heading>
              <Text
                fontFamily={isFire && 'Manrope'}
                textAlign="center"
                fontSize="sm"
              >
                We see you've already set up Capsule on another device
              </Text>
              <Text
                fontFamily={isFire && 'Manrope'}
                textAlign="center"
                fontSize="sm"
              >
                Please log in to Capsule on your other device by scanning this
                QR code or copying the link and sending it to your device with
                Capsule Set Up
              </Text>
              <Flex justifyContent="center">
                <QRCode value={urlForNewDeviceLogin} size={165} />
              </Flex>
              <Flex justifyContent="center">
                <CopyButton
                  onCopy={onCopy}
                  copyStatus={hasCopied ? 'Copied' : 'Copy'}
                  copyButtonDisabled={hasCopied}
                  backgroundColor={portalBackgroundColor}
                  textColor={portalTextColor}
                />
              </Flex>
              <Text
                fontFamily={isFire && 'Manrope'}
                textAlign="center"
                fontSize="sm"
              >
                If you are unable to log in to any existing devices, you will
                need to recover your account.{' '}
                <Link href={basePortalURL} textDecoration="underline">
                  Recover My Account
                </Link>
              </Text>
            </>
          </PortalModalWrapper>
        );
  }

  return paramsPartnerId && !partner ? undefined : (
    <PortalModalWrapper
      portalBackgroundColor={portalBackgroundColor}
      portalPrimaryButtonColor={portalPrimaryButtonColor}
      portalTextColor={portalTextColor}
      paramsPartnerId={paramsPartnerId}
    >
      <>
        {/* if first time logging into app, then need to accept scopes */}
        <Flex alignItems="center" justifyContent="center">
          <Image
            src={partner?.portalHeaderLogoUrl || '/wordmark_black.svg'}
            alt="Logo"
            width="50%"
            maxWidth={300}
          />
        </Flex>
        {loginDone && paramsPartnerId && partner?.policiesEnabled && (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={userId}
            partnerId={paramsPartnerId}
            isLogin
          />
        )}
        <Heading
          fontFamily={isFire && 'ClashDisplay'}
          textAlign="center"
          fontSize="2xl"
        >
          {newDeviceSessionLookupId
            ? 'Login to Authenticate New Device'
            : 'Login'}
        </Heading>
        <>
          {loginDone ? (
            <Text
              fontFamily={isFire && 'Manrope'}
              color={portalTextColor || 'green'}
              fontSize="lg"
              textAlign="center"
            >
              Login Complete. You can close this window if it does not
              automatically redirect...
            </Text>
          ) : (
            <>
              <Text
                fontFamily={isFire && 'Manrope'}
                textAlign="center"
                fontSize="sm"
              >
                {newDeviceSessionLookupId ? (
                  "It looks like you're trying to add Capsule to a new device."
                ) : (
                  <>
                    Log in {paramsPartnerId && `to ${partner.displayName}`} with
                    your Capsule passkey for <strong>{paramsEmail}</strong>
                  </>
                )}
              </Text>
              {!newDeviceSessionLookupId && (
                <Text
                  fontFamily={isFire && 'Manrope'}
                  textAlign="center"
                  fontSize="sm"
                >
                  If you've previously logged in on a different device, or there
                  is an error finding your key on this device, you should select{' '}
                  <strong>Add This Device</strong> below.
                  <a
                    href="https://docs.usecapsule.com/users/faq"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {' '}
                    <u>Learn More</u>
                  </a>
                </Text>
              )}
              <ModalButton
                portalPrimaryButtonColor={portalPrimaryButtonColor}
                portalPrimaryButtonTextColor={portalPrimaryButtonTextColor}
                isLoading={isLoggingIn}
                isFire={isFire}
                onClick={login}
              >
                {buttonText}
              </ModalButton>
              {!newDeviceSessionLookupId && (
                <Button
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                  onClick={addThisDevice}
                  fontSize="sm"
                  width="50%"
                  alignSelf={'center'}
                >
                  <Text
                    color={portalTextColor}
                    fontFamily={isFire && 'Manrope'}
                    as="u"
                  >
                    Add This Device
                  </Text>
                </Button>
              )}
            </>
          )}
        </>
      </>
    </PortalModalWrapper>
  );
}

export default AuthLogin;
