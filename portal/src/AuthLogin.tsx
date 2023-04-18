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
} from '@chakra-ui/react';

import { generateSignature } from './library/cryptography/webAuth';
import {
  encryptWithDerivedPublicKey,
  getDerivedPrivateKeyAndDecrypt,
} from './library/cryptography/utils';
import capsule from './capsule';

export async function authLogin(
  email: string,
  sessionId: string,
  encryptionKey: string,
) {
  // @ts-ignore
  const { data } = await capsule.ctx.capsuleClient.getWebChallenge(
    encodeURIComponent(email),
  );
  const sig = await generateSignature(data.challenge);
  // @ts-ignore
  const verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge({
    signature: sig.response,
    publicKey: sig.id,
    email,
    sessionId,
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
    sig.response.userHandle,
    encryptedSharesRes.data.keyShares,
  );
  const tempShareOpts = decryptedShares.map((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(encryptionKey, share.signer);
    return {
      walletId: share.walletId,
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
    };
  });
  // @ts-ignore
  await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(
    userId,
    tempShareOpts,
  );
}

function AuthLogin() {
  const [loginDone, updateLoginDone] = useState(false);

  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const encryptionKey = searchParams.get('encryptionKey');
  const sessionId = searchParams.get('sessionId');

  const login = useCallback(() => {
    authLogin(paramsEmail, sessionId, encryptionKey).then(() => {
      updateLoginDone(true);
      setTimeout(function () {
        window.close();
      }, 200);
    });
  }, [paramsEmail, sessionId, encryptionKey]);

  return (
    <ChakraProvider>
      <Container color="white" maxW="ld" padding={10}>
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
          Login Portal
        </Heading>
        <Text mb={8}>
          Login with Capsule to create your wallet.
        </Text>
        <Text mb={8}>
          We're using your device to safely store your wallet for use across
          web3. Don't worry, Capsule never collects or stores this information,
          it is only used to save your wallet to your device.
          <a>
            {' '}
            <u>Learn More</u>
          </a>
        </Text>

        <Container width="100%" display="flex" justifyContent="center">
          <Button
            colorScheme="green"
            onClick={login}
            size="lg"
            alignSelf={'center'}
          >
            Login
          </Button>
        </Container>

        {loginDone ? (
          <Text color="green" size="lg">
            Login Complete. Redirecting....
          </Text>
        ) : null}
      </Container>
    </ChakraProvider>
  );
}

export default AuthLogin;
