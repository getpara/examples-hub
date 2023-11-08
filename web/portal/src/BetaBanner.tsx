import {
    Alert,
    AlertIcon,
    Flex,
} from '@chakra-ui/react';
import { ENV } from './definitions';
import React from 'react'
import { Environment } from './library';
  
  
function BetaBanner() {
    return ENV !== Environment.PROD && (
        <Alert status='info' variant='left-accent' mb='5%'>
            <AlertIcon />
            You're using Capsule in a development (non-production) environment: {ENV}. Be wary of sharing sensitive information.
        </Alert>
    );
}

export default BetaBanner;
