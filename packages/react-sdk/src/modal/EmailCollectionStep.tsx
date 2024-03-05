import { ModalStep } from './steps';
import './css/modal.css'
import {
  Button,
  VStack,
  Input,
  Text,
  Box,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import WalletCreation from './assets/walletCreation';
import CapsuleWeb, { OAuthMethod } from '@usecapsule/web-sdk';
import FlowContext from './FlowContext';
import OAuthLayout from './oauth/OAuthLayout';

export function EmailCollectionStep({
  setEmail,
  email,
  capsule,
  appName,
  setIsCreateAccountType,
  setWebAuthURLForCreate,
  setWebAuthURLForLogin,
  setCurrentStep,
  currentStep,
  oAuthMethods,
}: {
  setWebAuthURLForCreate: (newValue: string) => void;
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setEmail: (newValue: string) => void;
  email: string;
  appName: string;
  capsule: CapsuleWeb;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
  currentStep: ModalStep;
  oAuthMethods: OAuthMethod[];
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
          <Text textColor="brand.text" fontSize="22px">Log In or Sign Up for</Text>
          <Text textColor="brand.text" fontSize="22px" fontWeight="bold">{appName}</Text>
        </Box>
        <Box width='274px'>
          <Text
            alignSelf="start"
            fontSize="12px"
            fontWeight={500}
            lineHeight='16px'
            textColor="#838587"
            marginTop={(oAuthMethods && oAuthMethods.length !== 0) ? "12px" : "80px" }
          >
            Email
          </Text>
          {/*
          // @ts-ignore */}
          <Input
            marginTop="4px"
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
          <Box flex={1} height="20px" />
          {(oAuthMethods && oAuthMethods.length !== 0) && <OAuthLayout 
            oAuthMethods={oAuthMethods} 
            setEmail={setEmail}
            setIsCreateAccountType={setIsCreateAccountType}
            setWebAuthURLForCreate={setWebAuthURLForCreate}
            setWebAuthURLForLogin={setWebAuthURLForLogin}
            setCurrentStep={setCurrentStep}
            capsule={capsule}
          />}
          {/*
          // @ts-ignore */}
          <Button
            width="100%"
            marginTop="40px"
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
          <Text marginTop='12px' textColor="brand.content" fontSize="s">
            This wallet can be used across websites. <a href='https://usecapsule.com' target='_blank' rel='noreferrer'><u>Learn more.</u></a>
          </Text>
        </Box>
      </VStack>
    </>
  );
}
