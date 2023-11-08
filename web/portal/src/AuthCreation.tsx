import { Buffer } from 'buffer';
global.Buffer = Buffer;
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Heading,
  Image,
  Button,
  Container,
  Text,
  Flex,
  ChakraProvider,
  Box,
} from '@chakra-ui/react';
import BetaBanner from './BetaBanner';

import { EncryptorType, KeyType, PublicKeyStatus } from '@usecapsule/user-management-client';
import { getPartnerTheme } from './theme';
import {
  createCredential,
  parseCredentialCreationRes,
} from './library/cryptography/webAuth';
import { decryptWithKeyPair, encryptWithDerivedPublicKey, getPublicKeyFromSignature } from './library/core/cryptography/utils';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { ENV } from './definitions';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import PoweredByCapsule from './assets/poweredByCapsule';
import { validateColorInput } from './validation';
import './fonts/fire/fire.css';

export async function authCreation(
  userId: string,
  email: string,
  biometricId: string,
  isForNewDevice: boolean,
): Promise<void> {
  const { creds, userHandle, algorithm } = await createCredential(ENV, userId, email);
  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(creds, algorithm);
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
    const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;
    const biometricEncryptedKeyshares = temporaryShares.map((share) => {
      const decryptedShare = decryptWithKeyPair(
        capsule.loginEncryptionKeyPair,
        share.encryptedShare,
        share.encryptedKey,
      );
      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(publicKeyHex, decryptedShare);

      return {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyType.USER,
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: publicKeyHex,
      }
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

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const paramsPartnerId = searchParams.get('partnerId');

  const portalBackgroundColor = validateColorInput(searchParams.get('portalBackgroundColor')) ?
    searchParams.get('portalBackgroundColor') :
    'white';
  const portalPrimaryButtonColor = validateColorInput(searchParams.get('portalPrimaryButtonColor')) ?
    decodeURIComponent(searchParams.get('portalPrimaryButtonColor')) :
    'black';
  const portalTextColor = validateColorInput(searchParams.get('portalTextColor')) ?
    decodeURIComponent(searchParams.get('portalTextColor')) :
    'black';
  const portalPrimaryButtonTextColor = validateColorInput(searchParams.get('portalPrimaryButtonTextColor')) ?
    decodeURIComponent(searchParams.get('portalPrimaryButtonTextColor')) :
    'white';
  const isForNewDevice = searchParams.get('isForNewDevice') === 'true';
  const [isFire, setIsFire] = useState(false);

  const setUpBiometrics = useCallback(() => {
    authCreation(paramsUserId, paramsEmail, paramsBiometricId, isForNewDevice).then(() => {
      updateBiometricDone(true);

      if (!paramsPartnerId || !partner?.policiesEnabled) {
        setTimeout(function () {
          setIsDone(true)
          window.close();
        }, 200);
      }
    });
  }, [biometricDone, paramsBiometricId, paramsEmail, paramsUserId]);

  const onPermissionsDone = () => {
    setTimeout(function () {
      setIsDone(true)
      window.close();
    }, 200);
  };

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (await userManagementClient.getPartner(paramsPartnerId)).data;
        setPartner(detailsRes.partner);
        if (detailsRes.partner.name === 'fire') {
          setIsFire(true);
        }
      }
    }
    getPartner()
  }, []);

  if (isForNewDevice) {
    return (paramsPartnerId && !partner) ? undefined : (
      <ChakraProvider theme={getPartnerTheme(portalBackgroundColor, portalPrimaryButtonColor, portalTextColor)}>
        <Container color="white" maxW="ld" padding={10} height="100%">
          <BetaBanner />
          {(biometricDone && paramsPartnerId && partner?.policiesEnabled) ? (
            <PermissionSelection
              onDone={onPermissionsDone}
              userId={paramsUserId}
              partnerId={paramsPartnerId}
            ></PermissionSelection>
          ) : (
            <>
              <Flex alignItems="center" justifyContent="left" mb="10%">
                <Image
                  src={partner?.portalHeaderLogoUrl || '/wordmark_black.svg'}
                  alt="Logo"
                />
              </Flex>
              <Heading fontFamily={isFire && "ClashDisplay"} fontSize="4vh" mb="10%">
                Finish Adding Device
              </Heading>
              <Text fontFamily={isFire && "Manrope"} fontSize="2.5vh" mb="10%">You successfully authenticated with Capsule on another device.</Text>
              <Text fontFamily={isFire && "Manrope"} fontSize="2.5vh" mb="10%">Finally, please finish adding this device.</Text>

              <Container width="100%" display="flex" justifyContent="center">
                <Button
                  colorScheme="green"
                  onClick={setUpBiometrics}
                  p="2.5vh"
                  fontSize="2.5vh"
                  maxWidth="50%"
                  alignSelf={'center'}
                  fontFamily={isFire && "Manrope"}
                  textColor="white"
                >
                  Complete Setup
                </Button>
              </Container>
            </>
          )}
          {isDone ? (
            <Text marginTop={4} fontSize="12px" fontFamily={isFire && "Manrope"} color={portalTextColor || "black"} size="lg">
              Authentication creation complete. You can close this window if it does not automatically redirect...
            </Text>
          ) : undefined}
        </Container>
        {paramsPartnerId && <Box backgroundColor={portalBackgroundColor} height="62px" width="100%">
          <Flex backgroundColor={portalBackgroundColor} h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
            <PoweredByCapsule color={portalTextColor} w={50} h={20} />
          </Flex>
        </Box>}
      </ChakraProvider>
    );
  }

  return (paramsPartnerId && !partner) ? undefined : (
    <ChakraProvider theme={getPartnerTheme(portalBackgroundColor, portalPrimaryButtonColor, portalTextColor)}>
      <Container textColor={portalTextColor} color={portalBackgroundColor} maxW="ld" padding="10%" height="100%">
        <BetaBanner />
        {(biometricDone && paramsPartnerId && partner?.policiesEnabled) ? (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={paramsUserId}
            partnerId={paramsPartnerId}
          ></PermissionSelection>
        ) : (
          <>
            <Flex alignItems="center" justifyContent="center" mb="10%">
              <Image
                src={partner?.portalHeaderLogoUrl || '/wordmark_black.svg'}
                alt="Logo"
                width="50%"
                maxWidth={300}
                marginRight={2}
              />
            </Flex>
            <Box>
              <Heading fontFamily={isFire && "ClashDisplay"} textAlign='center' fontSize="4vh" mb="10%">
                <Text fontWeight={500} fontSize='8vh'>
                  Set up passkey
                </Text>
              </Heading>
              <Text fontFamily={isFire && "Manrope"} textAlign='center' fontSize="2.5vh" mb="5%">
                {
                partner ? 
                <><strong>{partner.displayName}</strong> is using Capsule to create your wallet. 
                To continue, you will need to set up a Capsule passkey for <strong>{paramsEmail}</strong></> 
                : <>Authenticate with Capsule to create your wallet. To continue, you will need to set up a Capsule passkey for <strong>{paramsEmail}</strong></>
                }
              </Text>
              <Text fontFamily={isFire && "Manrope"} textAlign='center' fontSize="2.5vh" mb="20%">
                This passkey will let you access your wallet from many different applications.
                <a href="https://docs.usecapsule.com/users/faq" target='_blank' rel='noreferrer'>
                  {' '}
                  <u>Learn More</u>
                </a>
              </Text>

              <Container width="100%" display="flex" justifyContent="center">
                <Button
                  bg={portalPrimaryButtonColor}
                  onClick={setUpBiometrics}
                  p="2.5vh"
                  fontSize="3vh"
                  alignSelf={'center'}
                  height='9vh'
                  fontFamily={isFire && "Manrope"}
                >
                  <Text color={portalPrimaryButtonTextColor}>{isDone ? 'Success!' : 'Set Up'}</Text>
                </Button>
              </Container>
            </Box>
          </>
        )}
        {isDone ? (
          <Text marginTop={4} fontSize="12px" fontFamily={isFire && "Manrope"} color={portalTextColor || "black"} size="lg">
            Authentication creation complete. You can close this window if it does not automatically redirect...
          </Text>
        ) : undefined}
      </Container>
      <Box backgroundColor={portalBackgroundColor}  width="100%">
        <Flex backgroundColor={portalBackgroundColor} w="100%" justifyContent={'center'} alignItems={'center'}>
          <PoweredByCapsule color={portalTextColor} w={50} h={20} />
        </Flex>
      </Box>
    </ChakraProvider>
  );
}

export default AuthCreation;
