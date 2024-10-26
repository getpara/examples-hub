import { useCallback, useEffect, useState } from 'react';
import { AuthLoginStep } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { getAsymmetricKeyPair, getPublicKeyHex } from '@usecapsule/web-sdk';
import { useAuthLoginStep } from '../../hooks/useLoginStep';
import { useCapsule } from '../../components/CapsuleContext';
import { LoginProvider, useLogin } from './components/LoginProvider';
import { SelectWallet } from './components/SelectWallet';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { useCloseWindow } from '../../hooks/useCloseWindow';

const AuthLoginBase = () => {
  const capsule = useCapsule();
  const closeWindow = useCloseWindow();
  const { toggleBranding } = useModalOutletContext();
  const {
    fns: { authLogin, fetchWallets, authUpdateKeyShares },
    params: {
      sessionId,
      partnerId,
      encryptionKey,
      phone,
      email,
      farcasterUsername,
      newDeviceSessionLookupId,
      skipAutoLogin,
      isForKnownDeviceLogin,
    },
    biometricLocationHints,
  } = useLogin();
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [step, setStep] = useAuthLoginStep();

  const isAddingNewDevice = !!newDeviceSessionLookupId && !isForKnownDeviceLogin;

  const handleLoginFromOtherDevice = async () => {
    await postLogin();
  };

  const postLogin = async () => {
    await capsule.userSetupAfterLogin();

    const wallets = await fetchWallets();

    const [isWithoutWallets, isOnlyOwnedPartnerWallets] = [
      Object.values(wallets).every(arr => arr.length === 0),
      capsule.supportedWalletTypes.every(
        ({ type }) =>
          wallets[type].length === 1 && wallets[type][0].partnerId === partnerId && !wallets[type][0].pregenIdentifier,
      ),
    ];

    const defaultWalletIds = isOnlyOwnedPartnerWallets
      ? capsule.supportedWalletTypes.reduce((acc, { type }) => ({ ...acc, [type]: wallets[type].map(({ id }) => id) }), {})
      : undefined;

    if (!!defaultWalletIds || (isWithoutWallets && !capsule.ctx.apiKey)) {
      await capsule.setCurrentWalletIds(defaultWalletIds ?? {}, sessionId, isWithoutWallets);
      setStep(AuthLoginStep.SUCCESS);
    } else {
      setStep(AuthLoginStep.SELECT_WALLET);
    }
  };

  const login = useCallback(async () => {
    setStep(AuthLoginStep.WAITING);
    try {
      await capsule.touchSession();
      await authLogin();

      await postLogin();
    } catch (err) {
      if (err.message?.toLowerCase().includes('the document is not focused')) {
        setStep(AuthLoginStep.MANUAL_LOGIN);
        return;
      }
      await getWebAuthURLForAddDevice(true);
      setStep(AuthLoginStep.LOGIN_FAILED);
      console.error('Error retrieving passkey: ', err);
    }
  }, [capsule, authLogin]);

  useEffect(() => {
    async function finishLogin(shouldClose: boolean) {
      if (capsule.currentWalletIdsArray.length > 0) await authUpdateKeyShares();

      if (shouldClose) {
        closeWindow(true);
      }
    }

    if (step === AuthLoginStep.SUCCESS) {
      finishLogin(true);
    }
  }, [capsule, authUpdateKeyShares, step]);

  async function getWebAuthURLForAddDevice(isForKnownDeviceLogin?: boolean) {
    let touchRes = await capsule.touchSession();
    if (!touchRes.data.sessionLookupId) {
      touchRes = await capsule.touchSession(true);
    }
    if (!capsule.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(capsule.ctx);
      await capsule.setLoginEncryptionKeyPair(keyPair);
    }

    const url = await capsule.getWebAuthURLForLogin(
      sessionId,
      encryptionKey,
      partnerId,
      touchRes.data.sessionLookupId,
      getPublicKeyHex(capsule.loginEncryptionKeyPair),
      undefined,
      isForKnownDeviceLogin,
    );
    const shortUrl = await capsule.shortenLoginLink(url);
    setUrlForNewDeviceLogin(shortUrl);
  }

  // TODO: This will change when the new add device flow is added (This shouldn't get hit at all until then)
  useEffect(() => {
    async function getTemporaryShares() {
      try {
        const isActive = await capsule.isSessionActive();
        if (!isActive) {
          window.setTimeout(getTemporaryShares, 2000);
          return;
        }
        const touchRes = await capsule.touchSession();
        await capsule.setUserId(touchRes.data.userId);
        const fetchedWallets = await capsule.fetchWallets();
        const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;

        if (temporaryShares.length >= fetchedWallets.length) {
          const authCreationURL = await capsule.getSetUpBiometricsURL(true);
          setStep(AuthLoginStep.MANUAL_LOGIN);
          window.location.href = authCreationURL;
          return;
        }

        window.setTimeout(getTemporaryShares, 2000);
      } catch (e) {
        console.error(e);
        window.setTimeout(getTemporaryShares, 2000);
      }
    }

    if (!newDeviceSessionLookupId && step === AuthLoginStep.ADD) {
      getWebAuthURLForAddDevice();
      window.setTimeout(getTemporaryShares, 2000);
    }
  }, [capsule, step, sessionId, encryptionKey, partnerId]);

  useEffect(() => {
    if (step === AuthLoginStep.SELECT_WALLET) {
      toggleBranding(false);
    } else {
      toggleBranding(true);
    }
  }, [step]);

  useEffect(() => {
    if (
      (email || phone || farcasterUsername) &&
      sessionId &&
      encryptionKey &&
      !skipAutoLogin &&
      step === AuthLoginStep.MANUAL_LOGIN
    ) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      login();
    }
  }, [login]);

  if (step === AuthLoginStep.SELECT_WALLET) {
    return <SelectWallet sessionLookupId={sessionId} />;
  }

  return (
    <Card>
      <CardContent>
        {step !== AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING && <ModalHeader />}
        <Body
          step={step}
          sessionLookupId={sessionId}
          addDeviceUrl={urlForNewDeviceLogin}
          isAddingNewDevice={isAddingNewDevice}
          onLoginClick={login}
          onLoginFromAnotherDevice={handleLoginFromOtherDevice}
          setStep={setStep}
          biometricLocationHints={biometricLocationHints}
        />
      </CardContent>
    </Card>
  );
};

export const AuthLogin = () => (
  <LoginProvider>
    <AuthLoginBase />
  </LoginProvider>
);
