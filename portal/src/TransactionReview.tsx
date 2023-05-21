import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Heading,
  Button,
  Container,
  Text,
  ChakraProvider, Box, Spacer, VStack, Flex, Progress, HStack,
} from '@chakra-ui/react';

import { userManagementClient } from './userManagementClient';
import { generateSignature } from './library/cryptography/webAuth';
import CapsuleBox from "./assets/CapsuleBox";
import PoweredByCapsule from "./assets/poweredByCapsule";
import ScatteredDivider from "./assets/scatteredDivider";
import {newTheme} from "./library/modal/theme";

function TransactionReview() {
  const { userId, pendingTransactionId } = useParams();
  const [searchParams, _] = useSearchParams();
  const email = searchParams.get('email');
  const riskScore = searchParams.get('risk_temp') === null ? undefined : Number(searchParams.get('risk_temp'));
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const partnerName = pendingTransaction?.partner?.name
  async function onClickAccept() {
    const { data } = await userManagementClient.getWebChallenge(
      encodeURIComponent(email),
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

  const label = riskScore < 20 ? "Safe" : riskScore < 60 ? "Moderate" : "Risky";
  const color = riskScore < 20 ? "green" : riskScore < 60 ? "blue" : "red";
  const labelDolor = riskScore < 20 ? "#40902a" : riskScore < 60 ? "#254589" : "#992727";
  if (!pendingTransaction) {
    return <div></div>;
  }
  return (
    <ChakraProvider theme={newTheme}>
      <Box height="100%" padding="32px" paddingBottom="0px" marginBottom="-46px">
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
          {/* <Spacer /> */}
        </VStack>
      </Box>
      <Container color="white" maxW="ld" padding={10} justifyContent="center">
        {riskScore !== undefined && <><HStack justifyContent="space-between">
          <Text fontSize="s" margin="12px">
            Risk score
          </Text>
          <Text borderColor={labelDolor} textColor={labelDolor} fontSize="s" margin="2px" marginRight="12px !important"
                borderWidth="2px" paddingRight="10px" paddingLeft="10px" paddingTop="4px" paddingBottom="4px"
                borderRadius="26px">
            {label}
          </Text>
        </HStack>
          <Progress margin="12px" borderRadius="7px" value={Math.max(riskScore, 5)} backgroundColor="transparent" colorScheme={color} /></>}
          <Flex mb="18px" mt="18px" width="100%" justifyContent="center">
          <ScatteredDivider/>
        </Flex>
        {riskScore === 87 ? <Box padding="32px">
          <img src="/simulation-risky.png" alt="XXX"/>
        </Box> : riskScore === 7 ? <Box padding="32px">
            <img src="/simulation-safe.png" alt="XXX"/>
        </Box> : (
          <Text fontFamily={"monospace"} wordBreak="break-all" mb={8}>{JSON.stringify(pendingTransaction.decodedTx, null, 2)}</Text>
          )}
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
