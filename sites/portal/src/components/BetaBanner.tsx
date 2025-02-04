import { Alert, AlertIcon } from '@chakra-ui/react';
import { ENV } from '../constants';
import { Environment } from '@getpara/web-sdk';

function BetaBanner() {
  return (
    ENV !== Environment.PROD && (
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        You're using Para in a development (non-production) environment: {ENV}. Be wary of sharing sensitive information.
      </Alert>
    )
  );
}

export default BetaBanner;
