import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heading, Image, Text, Flex } from '@chakra-ui/react';

import {
  EncryptorType,
  KeyType,
  PublicKeyStatus,
} from '@usecapsule/user-management-client';
import {
  createCredential,
  parseCredentialCreationRes,
  decryptWithKeyPair,
  encryptWithDerivedPublicKey,
  getPublicKeyFromSignature,
} from '@usecapsule/react-sdk';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { ENV } from './definitions';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import { validateColorInput } from './validation';
import './fonts/fire/fire.css';
import { PortalModalWrapper } from './assets/modalComponents/PortalModalWrapper';
import { ModalButton } from './assets/modalComponents/ModalButton';

const DoneText = ({
  isFire,
  portalTextColor,
}: {
  isFire: boolean;
  portalTextColor: string;
}) => (
  <Text
    fontSize="lg"
    fontFamily={isFire && 'Manrope'}
    color={portalTextColor || 'black'}
    textAlign="center"
  >
    Authentication creation complete. You can close this window if it does not
    automatically redirect...
  </Text>
);

export async function authCreation(
  userId: string,
  email: string,
  biometricId: string,
  isForNewDevice: boolean,
): Promise<void> {
  const { creds, userHandle, algorithm } = await createCredential(
    ENV,
    userId,
    email,
  );
  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(
    creds,
    algorithm,
  );
  // @ts-ignore
  const publicKeyHex = await getPublicKeyFromSignature(capsule.ctx, userHandle);
  // @ts-ignore
  await capsule.ctx.capsuleClient.patchSessionPublicKey(userId, biometricId, {
    publicKey: creds.id,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });

  // this means we are adding additional biometrics to an existing account and need to encrypt
  // shares with new biometric
  // since we are redirecting to auth creation route from auth login route, the session initially
  // setup should still be available here
  if (isForNewDevice) {
    const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data
      .temporaryShares;
    const biometricEncryptedKeyshares = temporaryShares.map((share) => {
      const decryptedShare = decryptWithKeyPair(
        capsule.loginEncryptionKeyPair,
        share.encryptedShare,
        share.encryptedKey,
      );
      const { encryptedMessageHex, encryptedKeyHex } =
        encryptWithDerivedPublicKey(publicKeyHex, decryptedShare);

      return {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyType.USER,
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: publicKeyHex,
      };
    });

    await userManagementClient.uploadUserKeyShares(
      userId,
      biometricEncryptedKeyshares,
    );
  }
}

function AuthCreation() {
  const [biometricDone, updateBiometricDone] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [partner, setPartner] = useState<Partner | undefined>();
  const [isAwaitingBiometrics, setIsAwaitingBiometrics] = useState(false);

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
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
  const isForNewDevice = searchParams.get('isForNewDevice') === 'true';
  const [isFire, setIsFire] = useState(false);
  const buttonText = isDone
    ? 'Success!'
    : isForNewDevice
    ? 'Complete Set Up'
    : 'Set Up';

  const setUpBiometrics = useCallback(async () => {
    setIsAwaitingBiometrics(true);
    await authCreation(
      paramsUserId,
      paramsEmail,
      paramsBiometricId,
      isForNewDevice,
    )
      .then(() => {
        updateBiometricDone(true);

        if (!paramsPartnerId || !partner?.policiesEnabled) {
          setTimeout(function () {
            setIsDone(true);
            window.close();
          }, 200);
        }
      })
      .catch((e) => {
        console.error(e);
      });
    setIsAwaitingBiometrics(false);
  }, [biometricDone, paramsBiometricId, paramsEmail, paramsUserId]);

  const onPermissionsDone = () => {
    setTimeout(function () {
      setIsDone(true);
      window.close();
    }, 200);
  };

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

  if (isForNewDevice) {
    return paramsPartnerId && !partner ? undefined : (
      <PortalModalWrapper
        portalBackgroundColor={portalBackgroundColor}
        portalPrimaryButtonColor={portalPrimaryButtonColor}
        portalTextColor={portalTextColor}
        paramsPartnerId={paramsPartnerId}
      >
        <>
          {biometricDone && paramsPartnerId && partner?.policiesEnabled ? (
            <PermissionSelection
              onDone={onPermissionsDone}
              userId={paramsUserId}
              partnerId={paramsPartnerId}
            />
          ) : (
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
                fontSize="2xl"
                textAlign="center"
              >
                Finish Adding Device
              </Heading>
              {isDone ? (
                <DoneText portalTextColor={portalTextColor} isFire={isFire} />
              ) : (
                <>
                  <Text
                    fontFamily={isFire && 'Manrope'}
                    fontSize="sm"
                    textAlign="center"
                  >
                    You successfully authenticated with Capsule on another
                    device.
                  </Text>
                  <Text
                    fontFamily={isFire && 'Manrope'}
                    fontSize="sm"
                    textAlign="center"
                  >
                    Finally, please finish adding this device.
                  </Text>
                  <ModalButton
                    portalPrimaryButtonColor={portalPrimaryButtonColor}
                    portalPrimaryButtonTextColor={portalPrimaryButtonTextColor}
                    isLoading={isAwaitingBiometrics}
                    isFire={isFire}
                    onClick={setUpBiometrics}
                  >
                    {buttonText}
                  </ModalButton>
                </>
              )}
            </>
          )}
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
        {biometricDone && paramsPartnerId && partner?.policiesEnabled ? (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={paramsUserId}
            partnerId={paramsPartnerId}
          />
        ) : (
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
              Set Up Passkey
            </Heading>
            {isDone ? (
              <DoneText portalTextColor={portalTextColor} isFire={isFire} />
            ) : (
              <>
                <Text
                  fontFamily={isFire && 'Manrope'}
                  textAlign="center"
                  fontSize="sm"
                >
                  {partner ? (
                    <>
                      <strong>{partner.displayName}</strong> is using Capsule to
                      create your wallet. To continue, you will need to set up a
                      Capsule passkey for <strong>{paramsEmail}</strong>
                    </>
                  ) : (
                    <>
                      Authenticate with Capsule to create your wallet. To
                      continue, you will need to set up a Capsule passkey for{' '}
                      <strong>{paramsEmail}</strong>
                    </>
                  )}
                </Text>
                <Text
                  fontFamily={isFire && 'Manrope'}
                  textAlign="center"
                  fontSize="sm"
                >
                  This passkey will let you access your wallet from many
                  different applications.
                  <a
                    href="https://docs.usecapsule.com/users/faq"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {' '}
                    <u>Learn More</u>
                  </a>
                </Text>
                <ModalButton
                  portalPrimaryButtonColor={portalPrimaryButtonColor}
                  portalPrimaryButtonTextColor={portalPrimaryButtonTextColor}
                  isLoading={isAwaitingBiometrics}
                  isFire={isFire}
                  onClick={setUpBiometrics}
                >
                  {buttonText}
                </ModalButton>
              </>
            )}
          </>
        )}
      </>
    </PortalModalWrapper>
  );
}

export default AuthCreation;
