import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { authCreation } from '../../utils/authCreation';
import { AuthCreationStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Modal } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';

export const AuthCreation = () => {
  const [step, setStep] = useState<AuthCreationStep>(AuthCreationStep.SELECT_DEVICE);

  const { biometricId: paramsBiometricId, userId: paramsUserId } = useParams();
  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));

  const isForNewDevice = searchParams.get('isForNewDevice') === 'true';
  const paramsPartnerId = searchParams.get('partnerId');

  const setUpBiometrics = useCallback(async () => {
    setStep(AuthCreationStep.CREATING);
    try {
      await authCreation(paramsPartnerId, paramsUserId, paramsEmail, paramsBiometricId, isForNewDevice);
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
  }, [paramsBiometricId, paramsEmail, paramsUserId]);

  useEffect(() => {
    if (paramsBiometricId && paramsEmail && paramsUserId) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      setUpBiometrics();
    }
  }, []);

  return (
    <Modal noOverlay>
      <ModalHeader />
      <Body step={step} isForNewDevice={isForNewDevice} onAddThisDeviceClick={setUpBiometrics} />
    </Modal>
  );
};
