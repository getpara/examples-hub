import { useCallback, useEffect, useState } from 'react';
import { AuthLoginStep, PARA_PORTAL_ID } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { getAsymmetricKeyPair, getPublicKeyHex } from '@getpara/web-sdk';
import { usePara } from '../../components/ParaContext';
import { LoginProvider, LoginRes, useLogin } from './components/LoginProvider';
import { SelectWallet } from './components/SelectWallet';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { AuthMethod, isPasskeySupported } from '@getpara/web-sdk';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';

const AuthLoginBase = ({ authMethod }: { authMethod: AuthMethod }) => {
  const para = usePara();
  const closeWindow = useCloseWindow();
  const { toggleBranding, partner } = useModalOutletContext();
  const {
    fns: { authLogin, authLoginWithPassword, fetchWallets, authUpdateKeyShares },
    authInfo,
    params: { sessionId, partnerId, encryptionKey, newDeviceSessionLookupId, skipAutoLogin, isEmbedded },
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

    // For native apps, we need to ensure wallet signers are persisted before redirecting
    // Check for native callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const nativeCallbackUrl = urlParams.get('nativeCallbackUrl');

    if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
      // For native apps, persist wallet signers before redirecting
      if (loginRes) {
        try {
          await authUpdateKeyShares(loginRes);
        } catch (error) {
          console.error('Failed to update keyshares before native redirect', error);
          return; // Avoid redirecting if we failed to persist signers
        }
      }
      // Redirect to the native callback URL
      window.location.href = nativeCallbackUrl;
      return; // Exit early after redirect
    }

    if (fromKnownDevice) {
      if (!(await isPasskeySupported())) {
        closeWindow();
        return;
      }
      setStep(AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE);
      return;
    }

    const wallets = await fetchWallets();

    const isWithoutWallets = Object.values(wallets).every(arr => arr.length === 0);

    if (partner.id === PARA_PORTAL_ID) {
      const allWalletIds = para.supportedWalletTypes.reduce(
        (acc, { type }) => ({ ...acc, [type]: wallets[type].map(({ id }) => id) }),
        {},
      );
      await para.setCurrentWalletIds(allWalletIds, {
        sessionLookupId: sessionId,
        needsWallet: isWithoutWallets,
        newDeviceSessionLookupId,
      });
      await authUpdateKeyShares(loginRes);

      setStep(fromKnownDevice ? AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE : AuthLoginStep.SUCCESS);
      return;
    }

    const isOnlyOwnedPartnerWallets = para.supportedWalletTypes.every(
      ({ type }) =>
        wallets[type].length === 1 && wallets[type][0].partnerId === partnerId && !wallets[type][0].pregenIdentifier,
    );

    const defaultWalletIds = isOnlyOwnedPartnerWallets
      ? para.supportedWalletTypes.reduce((acc, { type }) => ({ ...acc, [type]: wallets[type].map(({ id }) => id) }), {})
      : undefined;

    if (para.isNoWalletConfig || !!defaultWalletIds || (isWithoutWallets && !para.ctx.apiKey)) {
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

  const loginWithPassword = async (password: string, isPIN?: boolean) => {
    try {
      setLoginWithPasswordError(undefined);
      await para.touchSession();
      const loginRes = await authLoginWithPassword(password, isPIN);

      await postLogin({ loginRes });
    } catch (err) {
      if (err.message === 'PIN creation requires auth verification') {
        setLoginWithPasswordError('User must be verified before logging in with PIN');
        return;
      }
      if (err.message === 'Rate limit exceeded, try again in a few minutes.') {
        setLoginWithPasswordError('Too many attempts, please try again in a few minutes.');
        return;
      }
      setLoginWithPasswordError(`${isPIN ? 'PIN' : 'Password'} is incorrect`);
    }
  };

  const login = useCallback(async () => {
    setStep(
      authMethod === AuthMethod.PASSWORD
        ? AuthLoginStep.ENTER_PASSWORD
        : authMethod === AuthMethod.PIN
          ? AuthLoginStep.ENTER_PIN
          : AuthLoginStep.WAITING,
    );

    if (authMethod === AuthMethod.PASSWORD || authMethod === AuthMethod.PIN) {
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
    let { sessionLookupId } = await para.touchSession();
    if (!sessionLookupId) {
      ({ sessionLookupId } = await para.touchSession(true));
    }
    if (!para.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(para.ctx);
      await para.setLoginEncryptionKeyPair(keyPair);
    }

    const url = await para.constructPortalUrl('loginAuth', {
      thisDevice: {
        sessionId,
        encryptionKey,
      },
      newDevice: {
        sessionId: sessionLookupId,
        encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair),
      },
      shorten: true,
    });

    setUrlForNewDeviceLogin(url);
  }

  useEffect(() => {
    if (authMethod === AuthMethod.PASSWORD || authMethod === AuthMethod.PIN) {
      setStep(authMethod === AuthMethod.PASSWORD ? AuthLoginStep.ENTER_PASSWORD : AuthLoginStep.ENTER_PIN);
    }
  }, [authMethod]);

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
    (async function () {
      if (!(await isPasskeySupported()) && authMethod === AuthMethod.PASSKEY) {
        getWebAuthURLForKnownDeviceLogin().then(() => {
          setStep(AuthLoginStep.LOGIN_FAILED);
        });

        return;
      }

      if (!!authInfo && sessionId && encryptionKey && !skipAutoLogin && step === AuthLoginStep.MANUAL_LOGIN) {
        // In development this will trigger a 'request is already pending.' error due to duplicate renders caused by React.StrictMode.
        // See ref: https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
        login();
      }
    })();
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

      const fetchedWallets = await para.fetchWallets();
      const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;

      if (temporaryShares.length >= fetchedWallets.length) {
        const { url } = await para.getNewCredentialAndUrl({ isForNewDevice: true });
        window.location.href = url;
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
        {step !== AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING && !isEmbedded && <ModalHeader />}
        <Body
          isEmbedded={isEmbedded}
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
