import { useEffect, useState, useCallback } from 'react';

import { authCreation, AuthCreationParams } from '../../utils/authCreation';
import { AuthCreationStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { usePara } from '../../components/ParaContext';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { extractAuthInfo } from '@getpara/user-management-client';
import { isPasskeySupported } from '@getpara/web-sdk';

export const AuthCreation = () => {
  const para = usePara();
  const [step, setStep] = useState<AuthCreationStep>(AuthCreationStep.MANUAL_CREATION);

  const params = useExtractedParams<AuthCreationParams>();

  const setUpBiometrics = useCallback(async () => {
    if (!(await isPasskeySupported())) {
      return;
    }

    setStep(AuthCreationStep.CREATING);
    try {
      await authCreation(para, params);

      setStep(AuthCreationStep.SUCCESS);
      setTimeout(function () {
        window.close();
      }, REDIRECT_TIMEOUT);
    } catch (err) {
      if (
        err.message?.toLowerCase().includes('the operation either timed out or was not allowed') ||
        err.message?.toLowerCase().includes('the document is not focused') ||
        err.message?.toLowerCase().includes('fallbackrequested')
      ) {
        setStep(AuthCreationStep.MANUAL_CREATION);
      } else {
        console.error('Error creating passkey: ', err);
      }
    }
  }, [params]);

  useEffect(() => {
    if (params.biometricId && !!extractAuthInfo(params) && params.userId) {
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
