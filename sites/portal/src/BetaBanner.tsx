import { Alert, AlertIcon } from '@chakra-ui/react';
import { ENV } from './definitions';
import { Environment } from '@usecapsule/react-sdk';

function BetaBanner() {
  return (
    ENV !== Environment.PROD && (
      <Alert status="info" variant="left-accent" mb="4">
        <AlertIcon />
        You're using Capsule in a development (non-production) environment:{' '}
        {ENV}. Be wary of sharing sensitive information.
      </Alert>
    )
  );
}

export default BetaBanner;
