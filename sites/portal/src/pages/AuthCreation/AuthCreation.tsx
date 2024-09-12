import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { authCreation } from '../../utils/authCreation';
import { AuthCreationStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { CountryCallingCode } from 'libphonenumber-js';
import { useCapsule } from '../../components/CapsuleContext';

export const AuthCreation = () => {
  const capsule = useCapsule();
  const [step, setStep] = useState<AuthCreationStep>(AuthCreationStep.SELECT_DEVICE);

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const paramsPhone = decodeURIComponent(searchParams.get('phone'));
  const paramsCountryCode = decodeURIComponent(searchParams.get('countryCode')) as CountryCallingCode;
  const paramsFarcasterUsername = decodeURIComponent(searchParams.get('farcasterUsername'));

  const isForNewDevice = searchParams.get('isForNewDevice') === 'true';
  const paramsPartnerId = searchParams.get('partnerId');

  const setUpBiometrics = useCallback(async () => {
    setStep(AuthCreationStep.CREATING);
    try {
      await authCreation(
        capsule,
        paramsPartnerId,
        paramsUserId,
        paramsEmail,
        paramsPhone,
        paramsCountryCode,
        paramsFarcasterUsername,
        paramsBiometricId,
        isForNewDevice,
      );

      setStep(AuthCreationStep.SUCCESS);
      setTimeout(function () {
        window.close();
      }, REDIRECT_TIMEOUT);
    } catch (err) {
      if (err.message.includes('The operation either timed out or was not allowed')) {
        setStep(AuthCreationStep.SELECT_DEVICE);
      } else {
        console.error('Error creating passkey: ', err);
      }
    }
  }, [paramsBiometricId, paramsEmail, paramsPhone, paramsCountryCode, paramsFarcasterUsername, paramsUserId]);

  useEffect(() => {
    if (paramsBiometricId && (paramsEmail || paramsPhone || paramsCountryCode || paramsFarcasterUsername) && paramsUserId) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      setUpBiometrics();
    }
  }, []);

  return (
    <Card>
      <CardContent>
        <ModalHeader />
        <Body step={step} isForNewDevice={isForNewDevice} userId={paramsUserId} onAddThisDeviceClick={setUpBiometrics} />
      </CardContent>
    </Card>
  );
};
