import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Heading,
  Button,
  Container,
  Text,
  ChakraProvider,
} from '@chakra-ui/react';

import { userManagementClient } from './userManagementClient';
import { generateSignature } from './library/cryptography/webAuth';

function TransactionReview() {
  const { userId, pendingTransactionId } = useParams();
  const [searchParams, _] = useSearchParams();
  const email = searchParams.get('email');
  const [pendingTransaction, setPendingTransaction] = useState(null);

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
      <Container color="white" maxW="ld" padding={10}>
        <Heading size="xl" mb={8}>
          Transaction Review
        </Heading>
        <Text mb={8}>{JSON.stringify(pendingTransaction, null, 2)}</Text>
        <Text mb={8}>If the transaction looks good, click accept below.</Text>

        <Container width="100%" display="flex" justifyContent="center">
          <Button
            colorScheme="green"
            onClick={onClickAccept}
            size="lg"
            alignSelf={'center'}
          >
            Accept Transaction
          </Button>
        </Container>
      </Container>
    </ChakraProvider>
  );
}

export default TransactionReview;
