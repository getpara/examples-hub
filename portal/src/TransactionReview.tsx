import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Heading,
  Button,
  Container,
  Text,
  ChakraProvider, Box, Spacer, VStack, Flex,
} from '@chakra-ui/react';

import { userManagementClient } from './userManagementClient';
import { generateSignature } from './library/cryptography/webAuth';
import CapsuleBox from "./assets/CapsuleBox";
import PoweredByCapsule from "./assets/poweredByCapsule";

function TransactionReview() {
  const { userId, pendingTransactionId } = useParams();
  const [searchParams, _] = useSearchParams();
  const email = searchParams.get('email');
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const partnerName = pendingTransaction.partner.name
  async function onClickAccept() {
    const { data } = await userManagementClient.getWebChallenge(
      decodeURIComponent(email),
    );
    const sig = await generateSignature(data.challenge, data.allowedPublicKeys);
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

  if (!pendingTransaction) {
    return <div></div>;
  }
  return (
    <ChakraProvider>
      <Box height="100%" padding="32px">
        <VStack alignItems="center" color="white" maxW="ld">
          <Text fontSize="m" textAlign="center">
            <b>{partnerName}</b> is requesting access to perform the following
            operation on your wallet
          </Text>
          <Text mb={8} fontSize="xs" textAlign="center">
            Please only proceed if you trust {partnerName}.
          </Text>
          <Box height="60px" alignItems="center" display="flex">
            <CapsuleBox />
          </Box>
          <Spacer />
        </VStack>
      </Box>
      <Container color="white" maxW="ld" padding={10}>
        <Text fontFamily={"monospace"} mb={8}>{JSON.stringify(pendingTransaction.decodedTx, null, 2)}</Text>

        <Container width="100%" display="flex" justifyContent="center">
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
            marginLeft="10px"
            colorScheme="green"
            onClick={onClickAccept}
            size="md"
            alignSelf={'center'}
          >
            Accept
          </Button>
        </Container>
        <Box height="62px" width="100%">
          <Flex h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
            <PoweredByCapsule w={50} h={20} />
          </Flex>
        </Box>
      </Container>
    </ChakraProvider>
  );
}

export default TransactionReview;
