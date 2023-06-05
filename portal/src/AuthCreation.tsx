import { Buffer } from 'buffer';
global.Buffer = Buffer;
import React, { useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Heading,
  Image,
  Button,
  Container,
  Text,
  Flex,
  ChakraProvider,
  extendTheme,
  Theme,
} from '@chakra-ui/react';
import { PublicKeyStatus } from '@usecapsule/user-management-client';
import { newTheme } from './library/modal/theme';
import {
  createCredential,
  parseCredentialCreationRes,
} from './library/cryptography/webAuth';
import { getPublicKeyFromSignature } from './library/cryptography/utils';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { ENV } from './definitions';

export async function authCreation(
  userId: string,
  email: string,
  biometricId: string,
): Promise<void> {
  const { creds, userHandle } = await createCredential(ENV, userId, email);
  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(creds);
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

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const paramsPartnerId = searchParams.get('partnerId');

  const setUpBiometrics = useCallback(() => {
    authCreation(paramsUserId, paramsEmail, paramsBiometricId).then(() => {
      updateBiometricDone(true);

      if (!paramsPartnerId) {
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

  return (
    <ChakraProvider theme={newTheme}>
      <Container color="white" maxW="ld" padding={10} height="100%">
        {(biometricDone && paramsPartnerId) ? (
          <PermissionSelection
            onDone={onPermissionsDone}
            userId={paramsUserId}
            partnerId={paramsPartnerId}
          ></PermissionSelection>
        ) : (
          <>
            <Flex alignItems="center" justifyContent="left" mb={12}>
              <Image
                src="/wordmark_white.svg"
                alt="Logo"
                width="50%"
                maxWidth={300}
                marginRight={2}
              />
            </Flex>
            <Heading size="xl" mb={8}>
              Authentication Portal
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
    </ChakraProvider>
  );
}

export default AuthCreation;
