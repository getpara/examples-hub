import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AuthLoginStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Modal } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { authLogin } from '../../utils/authLogin';
import capsule from '../../clients/capsule';
import { userManagementClient } from '../../clients/userManagementClient';
import { getAsymmetricKeyPair, getPublicKeyHex } from '@usecapsule/web-sdk';

const SESSION_STORAGE_AUTH_LOGIN_STEP = '@CAPSULE/loginFlowStep';

export const AuthLogin = () => {
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [step, setStepState] = useState<AuthLoginStep>(
    (sessionStorage.getItem(SESSION_STORAGE_AUTH_LOGIN_STEP) as AuthLoginStep | undefined) ?? AuthLoginStep.SELECT_FLOW,
  );
  function setStep(step: AuthLoginStep) {
    setStepState(step);
    sessionStorage.setItem(SESSION_STORAGE_AUTH_LOGIN_STEP, step);
  }

  const [searchParams, _] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const encryptionKey = searchParams.get('encryptionKey');
  const sessionId = searchParams.get('sessionId');
  const newDeviceSessionLookupId = searchParams.get('newDeviceSessionId') || undefined;
  const newDeviceEncryptionKey = searchParams.get('newDeviceEncryptionKey') || undefined;
  const paramsPartnerId = searchParams.get('partnerId');
  const paramsSkipAutoLogin = searchParams.get('skipAutoLogin') === 'true';

  const isAddingNewDevice = !!newDeviceSessionLookupId;

  const addDevice = () => {
    setStep(AuthLoginStep.ADD);
  };

  const login = useCallback(async () => {
    setStep(AuthLoginStep.WAITING);
    try {
      await authLogin(paramsEmail, sessionId, encryptionKey, newDeviceSessionLookupId, newDeviceEncryptionKey);

      setStep(AuthLoginStep.SUCCESS);
      setTimeout(function () {
        window.close();
      }, REDIRECT_TIMEOUT);
    } catch (err) {
      if (err.message.includes('The operation either timed out or was not allowed')) {
        setStep(AuthLoginStep.SELECT_FLOW);
      } else {
        console.error('Error retrieving passkey: ', err);
      }
    }
  }, [paramsEmail, sessionId, encryptionKey, newDeviceSessionLookupId, newDeviceEncryptionKey]);

  useEffect(() => {
    async function getTemporaryShares() {
      try {
        const isActive = await capsule.isSessionActive();
        if (!isActive) {
          window.setTimeout(getTemporaryShares, 2000);
          return;
        }
        const touchRes = await userManagementClient.touchSession();
        await capsule.setUserId(touchRes.data.userId);
        const fetchedWallets = (await capsule.fetchWallets()).filter((wallet) => !!wallet.address);
        const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;

        if (temporaryShares.length === fetchedWallets.length) {
          const authCreationURL = await capsule.getSetUpBiometricsURL(true);
          setStep(AuthLoginStep.SELECT_FLOW);
          window.location.href = authCreationURL;
          return;
        }

        window.setTimeout(getTemporaryShares, 2000);
      } catch (e) {
        console.error(e);
        window.setTimeout(getTemporaryShares, 2000);
      }
    }
    async function getWebAuthURLForAddDevice() {
      await capsule.setEmail(paramsEmail);
      let touchRes = await userManagementClient.touchSession();
      if (!touchRes.data.sessionLookupId) {
        touchRes = await userManagementClient.touchSession(true);
      }
      if (!capsule.loginEncryptionKeyPair) {
        const keyPair = await getAsymmetricKeyPair(capsule.ctx);
        await capsule.setLoginEncryptionKeyPair(keyPair);
      }

      const url = await capsule.getWebAuthURLForLogin(
        sessionId,
        encryptionKey,
        paramsPartnerId,
        touchRes.data.sessionLookupId,
        getPublicKeyHex(capsule.loginEncryptionKeyPair),
      );
      const shortUrl = await capsule.shortenLoginLink(url);
      setUrlForNewDeviceLogin(shortUrl);
    }

    if (!newDeviceSessionLookupId && step === AuthLoginStep.ADD) {
      getWebAuthURLForAddDevice();
      window.setTimeout(getTemporaryShares, 2000);
    }
  }, [step]);

  useEffect(() => {
    if (
      paramsEmail &&
      sessionId &&
      encryptionKey &&
      !paramsSkipAutoLogin &&
      (step === AuthLoginStep.SELECT_FLOW || step === AuthLoginStep.WAITING)
    ) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      login();
    }
  }, []);

  return (
    <Modal noOverlay>
      <ModalHeader />
      <Body
        step={step}
        addDeviceUrl={urlForNewDeviceLogin}
        isAddingNewDevice={isAddingNewDevice}
        onLoginClick={login}
        onAddDeviceClick={addDevice}
      />
    </Modal>
  );
};
