import { useEffect, useState, useCallback } from 'react';

import { authCreation, AuthCreationParams } from '../../utils/authCreation';
import { AuthCreationStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { useCapsule } from '../../components/CapsuleContext';
import { useExtractedParams } from '../../hooks/useExtractedParams';

export const AuthCreation = () => {
  const capsule = useCapsule();
  const [step, setStep] = useState<AuthCreationStep>(AuthCreationStep.MANUAL_CREATION);

  const params = useExtractedParams<AuthCreationParams>();

  const setUpBiometrics = useCallback(async () => {
    setStep(AuthCreationStep.CREATING);
    try {
      await authCreation(capsule, params);

      setStep(AuthCreationStep.SUCCESS);
      setTimeout(function () {
        window.close();
      }, REDIRECT_TIMEOUT);
    } catch (err) {
      if (
        err.message?.toLowerCase().includes('the operation either timed out or was not allowed') ||
        err.message?.toLowerCase().includes('the document is not focused')
      ) {
        setStep(AuthCreationStep.MANUAL_CREATION);
      } else {
        console.error('Error creating passkey: ', err);
      }
    }
  }, [params]);

  useEffect(() => {
    if (params.biometricId && (params.email || params.phone || params.farcasterUsername) && params.userId) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      setUpBiometrics();
    }
  }, []);

  return (
    <Card>
      <CardContent>
        <ModalHeader />
        <Body step={step} userId={params.userId} onCreateClick={setUpBiometrics} />
      </CardContent>
    </Card>
  );
};
