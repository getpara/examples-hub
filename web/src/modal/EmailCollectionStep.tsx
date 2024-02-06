import { ModalStep } from './steps';
import { Capsule } from '../Capsule';
import './css/modal.css'
import {
  Button,
  VStack,
  Input,
  Spacer,
  Text,
  HStack,
  Box,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import Plus from './assets/plus';
import WalletCreation from './assets/walletCreation';
import { CoreCapsule } from '../core/CoreCapsule';
import FlowContext from './FlowContext';

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

  const { setIsLogin } = useContext(FlowContext);

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
        <Box style={{marginTop: 12, width: '324px'}} display="flex" flexDirection="column" alignItems="center">
          {/* @ts-ignore */}
          <Text textColor="brand.text" fontSize="22px">Create Wallet for</Text>
          <Text textColor="brand.text" fontSize="22px" fontWeight="bold">{appName}</Text>
        </Box>
        <Box width='274px'>
          <Text marginTop='24px' textColor="brand.text" fontSize="20px" textAlign="center">
            Start signing up by entering your email
          </Text>
          {/*
          // @ts-ignore */}
          <Input
            marginTop='28px'
            placeholder="Email"
            type="email"
            borderColor="brand.frameColor"
            textColor="brand.text"
            background="brand.inputBackground"
            border="brand.inputBorder"
            borderRadius="5px"
            focusBorderColor="brand.text"
            onChange={async (e) => {
              const email = e.target.value;
              setEmail(email);
            }}
            value={email || ''}
          />
          <Text marginTop='12px' textColor="brand.content" fontSize="s">
            This wallet can be used across websites. Visit <a href='https://usecapsule.com' target='_blank' rel='noreferrer'><u>usecapsule.com</u></a> to
            view the list.
          </Text>
          <Box flex={1} height="32px" />
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
              capsule.clearStorage();

              const userExists = await capsule.checkIfUserExists(email);
              if (userExists) {
                const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
                setIsLogin(true);
                setCurrentStep(ModalStep.BIOMETRIC_LOGIN);
                setWebAuthURLForLogin(webAuthUrlForLogin);
                return;
              }

              await capsule.createUser(email);
              setIsLogin(false);
              setCurrentStep(ModalStep.VERIFICATION_CODE);
              setIsCreateAccountType(true);
            }}
          >
            Continue
          </Button>
        </Box>
      </VStack>
    </>
  );
}
