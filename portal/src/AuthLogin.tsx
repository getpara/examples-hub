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
} from '@chakra-ui/react';

import { generateSignature } from './library/cryptography/webAuth';
import {
  encryptWithDerivedPublicKey,
  getDerivedPrivateKeyAndDecrypt,
} from './library/cryptography/utils';
import capsule from './capsule';
import PermissionSelection from './PermissionSelection';
import { getPartnerTheme } from './theme';
import { userManagementClient } from './userManagementClient';
import { Partner } from './types';
import { ENV } from './definitions';
import PoweredByCapsule from './assets/poweredByCapsule';
import { validateColorInput } from './validation';

export async function authLogin(
  email: string,
  sessionLookupId: string,
  encryptionKey: string,
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
  const tempShareOpts = decryptedShares.map((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(encryptionKey, share.signer);
    return {
      walletId: share.walletId,
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
      sessionLookupId,
    };
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

  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const encryptionKey = searchParams.get('encryptionKey');
  const sessionId = searchParams.get('sessionId');
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
    authLogin(paramsEmail, sessionId, encryptionKey).then((userId: string) => {
      updateLoginDone(true);
      setUserId(userId);
      if (!paramsPartnerId || !partner?.policiesEnabled) {
        setTimeout(function () {
          window.close();
        }, 200);
      }
    });
  }, [paramsEmail, sessionId, encryptionKey]);

  // maybe show some text somewhere before closing
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
        <Heading size="xl" mb={8}>
          Login Portal
        </Heading>
        <Text mb={8}>Login with Capsule to create your wallet.</Text>
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
          <Text color={portalTextColor || "green"} size="lg">
            Login Complete. Redirecting....
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
