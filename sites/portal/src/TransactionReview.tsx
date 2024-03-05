import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Container,
  Text,
  Box,
  Flex,
  Progress,
  HStack,
} from '@chakra-ui/react';

import { userManagementClient } from './userManagementClient';
import { newTheme, Environment, generateSignature } from '@usecapsule/react-sdk';
import CapsuleBox from './assets/CapsuleBox';
import ScatteredDivider from './assets/scatteredDivider';
import { ENV } from './definitions';
import { PortalModalWrapper } from './assets/modalComponents/PortalModalWrapper';

function TransactionReview() {
  const { userId, pendingTransactionId } = useParams();
  const [searchParams, _] = useSearchParams();
  const email = searchParams.get('email');
  const riskScore =
    searchParams.get('risk_temp') === null
      ? undefined
      : Number(searchParams.get('risk_temp'));
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const partnerName = pendingTransaction?.partner?.displayName;
  async function onClickAccept() {
    const { data } = await userManagementClient.getWebChallenge(
      encodeURIComponent(email),
    );
    const sig = await generateSignature(
      ENV,
      data.challenge,
      data.allowedPublicKeys,
    );
    await userManagementClient.verifyWebChallenge({
      signature: sig.response,
      publicKey: sig.id,
      email,
    });
    await userManagementClient.acceptPendingTransaction(
      userId,
      pendingTransactionId,
    );
    setTimeout(function () {
      window.close();
    }, 200);
  }

  async function fetchPendingTransaction() {
    setPendingTransaction(
      (
        await userManagementClient.getPendingTransaction(
          userId,
          pendingTransactionId,
        )
      ).data,
    );
  }

  useEffect(() => {
    fetchPendingTransaction();
  }, []);

  const label = riskScore < 20 ? 'Safe' : riskScore < 60 ? 'Moderate' : 'Risky';
  const color = riskScore < 20 ? 'green' : riskScore < 60 ? 'blue' : 'red';
  const labelDolor =
    riskScore < 20 ? '#40902a' : riskScore < 60 ? '#254589' : '#992727';
  if (!pendingTransaction) {
    return <div></div>;
  }
  return (
    // Passing paramsPartnerId={'true'} to always show the PoweredByCapsule footer
    <PortalModalWrapper theme={newTheme} paramsPartnerId={'true'}>
      <>
        <Text fontSize="md" textAlign="center">
          <b>{partnerName}</b> is requesting access to perform the following
          operation on your wallet
        </Text>
        <Text fontSize="sm" textAlign="center">
          Please only proceed if you trust {partnerName}.
        </Text>
        <Box
          height="60px"
          alignItems="center"
          display="flex"
          justifyContent="center"
        >
          <CapsuleBox />
        </Box>
        {riskScore !== undefined && (
          <>
            <HStack justifyContent="space-between" mx={12}>
              <Text fontSize="sm">Risk score</Text>
              <Text
                borderColor={labelDolor}
                textColor={labelDolor}
                fontSize="sm"
                borderWidth="2px"
                paddingRight="10px"
                paddingLeft="10px"
                paddingTop="4px"
                paddingBottom="4px"
                rounded="full"
              >
                {label}
              </Text>
            </HStack>
            <Progress
              mx={12}
              rounded="full"
              value={Math.max(riskScore, 5)}
              backgroundColor="transparent"
              colorScheme={color}
            />
          </>
        )}
        <Flex width="100%" justifyContent="center">
          <ScatteredDivider />
        </Flex>
        {ENV === Environment.DEV && riskScore === 87 ? (
          <Box padding="32px">
            <img src="/simulation-risky.png" alt="XXX" />
          </Box>
        ) : ENV === Environment.DEV && riskScore === 7 ? (
          <Box padding="32px">
            <img src="/simulation-safe.png" alt="XXX" />
          </Box>
        ) : (
          <Text
            fontFamily={'monospace'}
            wordBreak="break-all"
            textAlign="center"
          >
            {JSON.stringify(pendingTransaction.decodedTx, null, 2)}
          </Text>
        )}
        <Container display="flex" justifyContent="center" gap={2}>
          <Button
            colorScheme="whiteAlpha"
            onClick={() => {
              window.close();
            }}
            size="md"
            alignSelf={'center'}
            width="140px"
          >
            Deny
          </Button>
          <Button
            width="140px"
            colorScheme="green"
            onClick={onClickAccept}
            size="md"
            alignSelf={'center'}
          >
            Accept
          </Button>
        </Container>
      </>
    </PortalModalWrapper>
  );
}

export default TransactionReview;
