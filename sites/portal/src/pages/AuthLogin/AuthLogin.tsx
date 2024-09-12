import { useCallback, useEffect, useState } from 'react';
import { AuthLoginStep, REDIRECT_TIMEOUT } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { getAsymmetricKeyPair, getPublicKeyHex, getSchemes } from '@usecapsule/web-sdk';
import { useAuthLoginStep } from '../../hooks/useLoginStep';
import { useCapsule } from '../../components/CapsuleContext';
import { LoginProvider, useLogin } from './components/LoginProvider';
import { SelectWallet } from './components/SelectWallet';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { WalletEntity, WalletScheme } from '@usecapsule/user-management-client';

function isOnlyPartnerWallets(
  considered: WalletEntity[],
  notConsidered: WalletEntity[],
  schemes: WalletScheme[],
  partnerId: string,
) {
  return (
    notConsidered.length === 0 &&
    considered.length === schemes.length &&
    schemes.every(s => considered.some(w => w.scheme === s && w.partnerId === partnerId))
  );
}

const AuthLoginBase = () => {
  const capsule = useCapsule();
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
    },
  } = useLogin();
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [step, setStep] = useAuthLoginStep();

  const isAddingNewDevice = !!newDeviceSessionLookupId;

  const addDevice = () => {
    setStep(AuthLoginStep.ADD);
  };

  const login = useCallback(async () => {
    setStep(AuthLoginStep.WAITING);
    try {
      await capsule.ctx.capsuleClient.touchSession();
      await authLogin();

      await capsule.userSetupAfterLogin();

      const { wallets, pregenWallets } = await fetchWallets();

      const walletSchemes = getSchemes(capsule.supportedWalletTypes);

      const [isWithoutWallets, isOnlyPartnerPregenWallets, isOnlyPartnerOwnedWallets] = [
        wallets.length === 0 && pregenWallets.length === 0,
        isOnlyPartnerWallets(pregenWallets, wallets, walletSchemes, partnerId),
        isOnlyPartnerWallets(wallets, pregenWallets, walletSchemes, partnerId),
      ];

      const defaultWallets = isOnlyPartnerPregenWallets ? pregenWallets : isOnlyPartnerOwnedWallets ? wallets : undefined;

      if (defaultWallets || (isWithoutWallets && !capsule.ctx.apiKey)) {
        await capsule.setCurrentWalletIds(
          defaultWallets ? defaultWallets.map(({ id }) => id) : [],
          sessionId,
          isWithoutWallets,
        );
        setStep(AuthLoginStep.SUCCESS);
      } else {
        setStep(AuthLoginStep.SELECT_WALLET);
      }
    } catch (err) {
      if (err.message.includes('The operation either timed out or was not allowed')) {
        setStep(AuthLoginStep.SELECT_FLOW);
      } else {
        console.error('Error retrieving passkey: ', err);
      }
    }
  }, [capsule, authLogin]);

  useEffect(() => {
    async function finishLogin(shouldClose: boolean) {
      if (capsule.currentWalletIds?.length > 0) await authUpdateKeyShares();

      if (shouldClose) {
        setTimeout(function () {
          window.close();
        }, REDIRECT_TIMEOUT);
      }
    }

    if (step === AuthLoginStep.SUCCESS) {
      finishLogin(true);
    }
  }, [capsule, authUpdateKeyShares, step]);

  useEffect(() => {
    async function getTemporaryShares() {
      try {
        const isActive = await capsule.isSessionActive();
        if (!isActive) {
          window.setTimeout(getTemporaryShares, 2000);
          return;
        }
        const touchRes = await capsule.ctx.capsuleClient.touchSession();
        await capsule.setUserId(touchRes.data.userId);
        const fetchedWallets = await capsule.fetchWallets();
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
      let touchRes = await capsule.ctx.capsuleClient.touchSession();
      if (!touchRes.data.sessionLookupId) {
        touchRes = await capsule.ctx.capsuleClient.touchSession(true);
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
      );
      const shortUrl = await capsule.shortenLoginLink(url);
      setUrlForNewDeviceLogin(shortUrl);
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
      step === AuthLoginStep.SELECT_FLOW
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
        <ModalHeader />
        <Body
          step={step}
          sessionLookupId={sessionId}
          addDeviceUrl={urlForNewDeviceLogin}
          isAddingNewDevice={isAddingNewDevice}
          onLoginClick={login}
          onAddDeviceClick={addDevice}
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
