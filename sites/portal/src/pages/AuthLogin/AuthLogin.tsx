import { useCallback, useEffect, useState } from 'react';
import { AuthLoginStep } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { getAsymmetricKeyPair, getPublicKeyHex } from '@getpara/web-sdk';
import { usePara } from '../../components/ParaContext';
import { LoginProvider, LoginRes, useLogin } from './components/LoginProvider';
import { SelectWallet } from './components/SelectWallet';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { AuthMethod } from '@getpara/web-sdk';

const AuthLoginBase = ({ authMethod }) => {
  const para = usePara();
  const closeWindow = useCloseWindow();
  const { toggleBranding } = useModalOutletContext();
  const {
    fns: { authLogin, authLoginWithPassword, fetchWallets, authUpdateKeyShares },
    authInfo,
    params: { sessionId, partnerId, encryptionKey, newDeviceSessionLookupId, skipAutoLogin },
    biometricLocationHints,
  } = useLogin();
  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [step, setStep] = useState(AuthLoginStep.MANUAL_LOGIN);
  const [loginWithPasswordError, setLoginWithPasswordError] = useState<string | undefined>();
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  const isKnownDeviceLogin = !!newDeviceSessionLookupId;

  const handleLoginFromOtherDevice = async () => {
    await postLogin({ fromKnownDevice: true });
  };

  const postLogin = async ({ fromKnownDevice, loginRes }: { fromKnownDevice?: boolean; loginRes?: LoginRes }) => {
    await para.userSetupAfterLogin();

    if (fromKnownDevice) {
      setStep(AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE);
      return;
    }

    const wallets = await fetchWallets();

    const [isWithoutWallets, isOnlyOwnedPartnerWallets] = [
      Object.values(wallets).every(arr => arr.length === 0),
      para.supportedWalletTypes.every(
        ({ type }) =>
          wallets[type].length === 1 && wallets[type][0].partnerId === partnerId && !wallets[type][0].pregenIdentifier,
      ),
    ];

    const defaultWalletIds = isOnlyOwnedPartnerWallets
      ? para.supportedWalletTypes.reduce((acc, { type }) => ({ ...acc, [type]: wallets[type].map(({ id }) => id) }), {})
      : undefined;

    if (!!defaultWalletIds || (isWithoutWallets && !para.ctx.apiKey)) {
      await para.setCurrentWalletIds(defaultWalletIds ?? {}, {
        sessionLookupId: sessionId,
        needsWallet: isWithoutWallets,
        newDeviceSessionLookupId,
      });
      if (para.currentWalletIdsArray.length > 0) {
        await authUpdateKeyShares(loginRes);
      }
      setStep(fromKnownDevice ? AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE : AuthLoginStep.SUCCESS);
    } else {
      setStep(AuthLoginStep.SELECT_WALLET);
    }
  };

  const loginWithPassword = async (password: string) => {
    try {
      setLoginWithPasswordError(undefined);
      await para.touchSession();
      const loginRes = await authLoginWithPassword(password);

      await postLogin({ loginRes });
    } catch (err) {
      setLoginWithPasswordError('Password is incorrect');
    }
  };

  const login = useCallback(async () => {
    setStep(authMethod === AuthMethod.PASSWORD ? AuthLoginStep.ENTER_PASSWORD : AuthLoginStep.WAITING);

    if (authMethod === AuthMethod.PASSWORD) {
      return;
    }

    try {
      await para.touchSession();

      const loginRes = await authLogin();

      await postLogin({ loginRes });
    } catch (err) {
      if (err.message?.toLowerCase().includes('the document is not focused')) {
        setStep(AuthLoginStep.MANUAL_LOGIN);
        return;
      }
      await getWebAuthURLForKnownDeviceLogin();
      setStep(AuthLoginStep.LOGIN_FAILED);
      console.error('Error retrieving passkey: ', err);
    }
  }, [para, authLogin, authMethod]);

  async function getWebAuthURLForKnownDeviceLogin() {
    let touchRes = await para.touchSession();
    if (!touchRes.data.sessionLookupId) {
      touchRes = await para.touchSession(true);
    }
    if (!para.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(para.ctx);
      await para.setLoginEncryptionKeyPair(keyPair);
    }

    const url = await para.getWebAuthURLForLogin({
      authType: authInfo?.authType,
      sessionId,
      loginEncryptionPublicKey: encryptionKey,
      partnerId,
      newDeviceSessionId: touchRes.data.sessionLookupId,
      newDeviceEncryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair),
    });
    const shortUrl = await para.shortenLoginLink(url);
    setUrlForNewDeviceLogin(shortUrl);
  }

  useEffect(() => {
    if (step === AuthLoginStep.SUCCESS) {
      closeWindow(true);
    }
  }, [step]);

  useEffect(() => {
    if (step === AuthLoginStep.SELECT_WALLET) {
      toggleBranding(false);
    } else {
      toggleBranding(true);
    }
  }, [step]);

  useEffect(() => {
    if (!!authInfo && sessionId && encryptionKey && !skipAutoLogin && step === AuthLoginStep.MANUAL_LOGIN) {
      // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
      // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
      login();
    }
  }, [login]);

  const handleAddPasskeyClick = async () => {
    setIsAddingDevice(true);
    setStep(AuthLoginStep.WAITING);

    const reset = () => {
      setStep(AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE);
      setIsAddingDevice(false);
    };

    try {
      const isActive = await para.isSessionActive();
      if (!isActive) {
        reset();
        return;
      }
      const touchRes = await para.touchSession();
      await para.setUserId(touchRes.data.userId);
      const fetchedWallets = await para.fetchWallets();
      const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;

      if (temporaryShares.length >= fetchedWallets.length) {
        const authCreationURL = await para.getSetUpBiometricsURL({ isForNewDevice: true });
        window.location.href = authCreationURL;
      } else {
        reset();
      }
    } catch (err) {
      console.error('Error adding passkey.', err);
      reset();
    }
  };

  if (step === AuthLoginStep.SELECT_WALLET) {
    return (
      <SelectWallet
        sessionLookupId={sessionId}
        onSuccess={() => {
          setStep(AuthLoginStep.SUCCESS);
        }}
        isKnownDeviceLogin={isKnownDeviceLogin}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        {step !== AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING && <ModalHeader />}
        <Body
          step={step}
          sessionLookupId={sessionId}
          addDeviceUrl={urlForNewDeviceLogin}
          onLoginClick={login}
          onLoginWithPasswordClick={loginWithPassword}
          onLoginFromAnotherDevice={handleLoginFromOtherDevice}
          setStep={setStep}
          onAddPasskeyClick={handleAddPasskeyClick}
          biometricLocationHints={biometricLocationHints}
          loginWithPasswordError={loginWithPasswordError}
          isKnownDeviceLogin={isKnownDeviceLogin}
          isAddingDevice={isAddingDevice}
        />
      </CardContent>
    </Card>
  );
};

export const AuthLogin = ({ authMethod }: { authMethod: AuthMethod }) => (
  <LoginProvider>
    <AuthLoginBase authMethod={authMethod} />
  </LoginProvider>
);
