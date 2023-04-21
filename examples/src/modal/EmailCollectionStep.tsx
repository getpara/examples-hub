import { ModalStep } from './steps';
import Capsule from '../library';
import { Button, Input, Spacer, Text } from '@chakra-ui/react';
import React from 'react';

export function EmailCollectionStep({
  setEmail,
  email,
  capsule,
  setIsCreateAccountType,
  setWebAuthURLForLogin,
  setCurrentStep,
  currentStep,
}: {
  setWebAuthURLForLogin: (newValue: string) => void;
  setCurrentStep: (newValue: ModalStep) => void;
  setEmail: (newValue: string) => void;
  email: string;
  capsule: Capsule;
  setIsCreateAccountType: (isCreateAccountType: boolean) => void;
  currentStep: ModalStep;
}) {
  if (currentStep !== ModalStep.EMAIL_COLLECTION) {
    return null;
  }
  return (
    <>
      <Text width="100%">Enter your email</Text>
      <Input
        placeholder="e-mail"
        type="email"
        borderColor={'brand.frameColor'}
        textColor="brand.text"
        onChange={async (e) => {
          const email = e.target.value;
          setEmail(email);
        }}
        value={email || ''}
      />
      <Spacer />
      <Button
        onClick={async () => {
          // TODO: add regex check here or in backend (or both)
          if (!email) {
            throw new Error('email is required');
          }
          capsule.clearStorage(true);

          try {
            await capsule.createUser(email);
            setIsCreateAccountType(true);
            setCurrentStep(ModalStep.VERIFICATION_CODE);
            return;
          } catch (e) {
            // 409 status code means user already exists so user is logging in
            if (e?.response?.status !== 409) {
              throw e;
            }
            const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
            setCurrentStep(ModalStep.BIOMETRIC_LOGIN);
            setWebAuthURLForLogin(webAuthUrlForLogin);
          }
        }}
      >
        Enter
      </Button>
    </>
  );
}
