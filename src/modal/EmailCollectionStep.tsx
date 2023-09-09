import { ModalStep } from './steps';
import { Capsule } from '../Capsule';
import {
  Button,
  VStack,
  Input,
  Spacer,
  Text,
  HStack,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import Plus from './assets/plus';
import WalletCreation from './assets/walletCreation';
import { CoreCapsule } from '../CoreCapsule';

export function EmailCollectionStep({
  setEmail,
  email,
  capsule,
  appName,
  setIsCreateAccountType,
  setWebAuthURLForLogin,
  setCurrentStep,
  currentStep,
}: {
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setEmail: (newValue: string) => void;
  email: string;
  appName: string;
  capsule: Capsule | CoreCapsule;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
  currentStep: ModalStep;
}) {
  if (currentStep !== ModalStep.EMAIL_COLLECTION) {
    return null;
  }
  return (
    <>
      {/* 
      // @ts-ignore */}
      <VStack alignItems="center" display="flex" flex={1}>
        <WalletCreation />
        {/* 
        // @ts-ignore */}
        <Text textColor="brand.text" fontSize="ml">
          Create Wallet for <b>{appName}</b>.
        </Text>
        <Text textColor="brand.text" fontSize="ml" textAlign="center">
          Start signing up by entering your email.
        </Text>
        <Spacer />
        <HStack alignItems="start">
          <Box marginTop="6px">
            <Plus />
          </Box>
          <Box>
            <Text textColor="brand.content" fontSize="m">
              Enter email
            </Text>
            <Text textColor="brand.content" fontSize="s">
              This wallet can be used across websites. Visit <a href='https://usecapsule.com' target='_blank' rel='noreferrer'><u>usecapsule.com</u></a> to
              view the list.
            </Text>
          </Box>
        </HStack>

        <Spacer />
        {/* 
        // @ts-ignore */}
        <Input
          placeholder="Email"
          type="email"
          borderColor="brand.frameColor"
          textColor="brand.text"
          background="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          borderRadius="5px"
          focusBorderColor="brand.text"
          onChange={async (e) => {
            const email = e.target.value;
            setEmail(email);
          }}
          value={email || ''}
        />
        <Box flex={1} height="40px" />
        {/* 
        // @ts-ignore */}
        <Button
          width="100%"
          onClick={async () => {
            // TODO move to a function :sweat_smile:
            // TODO: add regex check here or in backend (or both)
            if (!email) {
              throw new Error('email is required');
            }
            capsule.clearStorage(true);

            const userExists = await capsule.checkIfUserExists(email);
            if (userExists) {
              const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
              setCurrentStep(ModalStep.BIOMETRIC_LOGIN);
              setWebAuthURLForLogin(webAuthUrlForLogin);
              return;
            }

            await capsule.createUser(email);
            setCurrentStep(ModalStep.VERIFICATION_CODE);
            setIsCreateAccountType(true);
          }}
        >
          Continue
        </Button>
      </VStack>
    </>
  );
}
