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
import { PublicKeyStatus } from '@usecapsule/user-management-client';
import { getPartnerTheme } from './theme';
import {
  createCredential,
  parseCredentialCreationRes,
} from './library/cryptography/webAuth';
import { getPublicKeyFromSignature } from './library/cryptography/utils';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { ENV } from './definitions';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import PoweredByCapsule from './assets/poweredByCapsule';
import { validateColorInput } from './validation';

export async function authCreation(
  userId: string,
  email: string,
  biometricId: string,
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
}

function AuthCreation() {
  const [biometricDone, updateBiometricDone] = useState(false);
  const [partner, setPartner] = useState<Partner | undefined>();

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
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

  const setUpBiometrics = useCallback(() => {
    authCreation(paramsUserId, paramsEmail, paramsBiometricId).then(() => {
      updateBiometricDone(true);

      if (!paramsPartnerId || !partner?.policiesEnabled) {
        setTimeout(function () {
          window.close();
        }, 200);
      }
    });
  }, [biometricDone, paramsBiometricId, paramsEmail, paramsUserId]);

  const onPermissionsDone = () => {
    setTimeout(function () {
      window.close();
    }, 200);
  };

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (await userManagementClient.getPartner(paramsPartnerId)).data;
        setPartner(detailsRes.partner);
      }
    }
    getPartner()
  }, []);

  return (paramsPartnerId && !partner) ? undefined : (
    <ChakraProvider theme={getPartnerTheme(portalBackgroundColor, portalPrimaryButtonColor, portalTextColor)}>
      <Container color="white" maxW="ld" padding={10} height="100%">
        {(biometricDone && paramsPartnerId && partner?.policiesEnabled) ? (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={paramsUserId}
            partnerId={paramsPartnerId}
          ></PermissionSelection>
        ) : (
          <>
            <Flex alignItems="center" justifyContent="left" mb={12}>
              <Image
                src={partner?.portalHeaderLogoUrl || '/wordmark_white.svg'}
                alt="Logo"
                width="50%"
                maxWidth={300}
                marginRight={2}
              />
            </Flex>
            <Heading size="xl" mb={8}>
              {partner ?
                `${partner.displayName} is using Capsule to create your wallet` :
                'Authentication Portal'
              }
            </Heading>
            <Text mb={8}>Authenticate with Capsule to create your wallet.</Text>
            <Text mb={8}>
              We're using your device to safely store your wallet for use across
              web3. Don't worry, Capsule never collects or stores this
              information, it is only used to save your wallet to your device.
              <a>
                {' '}
                <u>Learn More</u>
              </a>
            </Text>

            <Container width="100%" display="flex" justifyContent="center">
              <Button
                colorScheme="green"
                onClick={setUpBiometrics}
                size="lg"
                alignSelf={'center'}
              >
                Set up
              </Button>
            </Container>
          </>
        )}
      </Container>
      {paramsPartnerId && <Box backgroundColor={portalBackgroundColor} height="62px" width="100%">
        <Flex backgroundColor={portalBackgroundColor} h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
          <PoweredByCapsule color={portalTextColor} w={50} h={20} />
        </Flex>
      </Box>}
    </ChakraProvider>
  );
}

export default AuthCreation;
