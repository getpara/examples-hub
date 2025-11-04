import { useCallback, useEffect, useState, useRef } from 'react';
import { AuthLoginStep, PARA_PORTAL_ID } from '../../constants';
import { Body } from './components/Body';
import { Card, CardContent } from '../../components/common';
import { ModalHeader } from '../../components/ModalHeader';
import { getAsymmetricKeyPair, getPublicKeyHex } from '@getpara/web-sdk';
import { usePara } from '../../components/ParaContext';
import { LoginProvider, useLogin } from './components/LoginProvider';
import { SelectWallet } from './components/SelectWallet';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { AuthMethod, TAuthMethod, isPasskeySupported } from '@getpara/web-sdk';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';
import { NativeCallbackStatus } from '../../types';
import { isIFramed } from '../../utils/isIFramed';
import { getDefaultWalletIds } from '../../utils/getDefaultWalletIds';
import { LoginRes } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { useNavigateWithCurrentParams } from '../../hooks/useNavigateWithCurrentParams';

const AuthLoginBase = ({ step: propsStep }: { step?: AuthLoginStep }) => {
  const para = usePara();
  const closeWindow = useCloseWindow();
  const { toggleBranding, partner } = useModalOutletContext();
  const { authMethod, isSwitchingWallets } = useLogin();

  const {
    fns: {
      authLogin,
      authLoginWithPassword,
      fetchWallets,
      authUpdateKeyShares,
      authUpdateEnclaveKeyShares,
      checkIsEnclaveUser,
      addAllEnclaveSharesForNewCredential,
      addAllSharesForNewCredential,
      getSkipBasicLoginUpgradePromptPreference,
    },
    authInfo,
    params: { sessionId, partnerId, encryptionKey, newDeviceSessionLookupId, skipAutoLogin },
    biometricLocationHints,
  } = useLogin();

  const [urlForNewDeviceLogin, setUrlForNewDeviceLogin] = useState<string>('');
  const [step, setStep] = useState(
    propsStep ??
      (() => {
        switch (true) {
          case isSwitchingWallets:
            return AuthLoginStep.WAITING;
          case authMethod === AuthMethod.PASSKEY:
            return AuthLoginStep.WAITING;
          case authMethod === AuthMethod.PASSWORD:
            return AuthLoginStep.ENTER_PASSWORD;
          case authMethod === AuthMethod.PIN:
            return AuthLoginStep.ENTER_PIN;
          case authMethod === AuthMethod.BASIC_LOGIN:
            return AuthLoginStep.WAITING;
          default:
            return AuthLoginStep.MANUAL_LOGIN;
        }
      })(),
  );
  const [postLoginRes, setPostLoginRes] = useState<LoginRes>();

  const [loginWithPasswordError, setLoginWithPasswordError] = useState<string | undefined>();
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithCurrentParams();

  const isKnownDeviceLogin = !!newDeviceSessionLookupId;
  const isAutoLoginAttempted = useRef(false);

  const handleLoginFromOtherDevice = async () => {
    await postLogin({ fromKnownDevice: true });
  };

  const postLogin = async ({
    fromKnownDevice,
    loginRes,
    fromBasicLoginUpgrade,
  }: {
    fromKnownDevice?: boolean;
    loginRes?: LoginRes;
    fromBasicLoginUpgrade?: boolean;
  }) => {
    setPostLoginRes(loginRes);

    if (isSwitchingWallets) {
      await fetchWallets();
      setStep(AuthLoginStep.SELECT_WALLET);
      return;
    }

    const auth = await para.ctx.client.sessionAuth(sessionId);
    const nativeCallbackUrl = searchParams.get('nativeCallbackUrl');
    const loginCallbackRoute = searchParams.get('loginCallbackRoute');

    // Handle native apps first - they always redirect, even for new users
    if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
      await para.userSetupAfterLogin();
      const isEnclaveUser = await checkIsEnclaveUser();
      // Native apps need wallet selection before redirecting
      const wallets = await fetchWallets();
      const isWithoutWallets = Object.values(wallets).every(arr => arr.length === 0);
      const selectionParams = {
        sessionLookupId: sessionId,
        needsWallet: isWithoutWallets,
        newDeviceSessionLookupId,
      };

      let selectionApplied = false;

      if (partner.id === PARA_PORTAL_ID) {
        // Para portal, using all wallet IDs
        const allWalletIds = para.supportedWalletTypes.reduce(
          (acc, { type }) => ({
            ...acc,
            [type]: (wallets[type] ?? []).map(({ id }) => id),
          }),
          {},
        );

        if (Object.keys(allWalletIds).length > 0 || isWithoutWallets) {
          await para.setCurrentWalletIds(allWalletIds, selectionParams);
          selectionApplied = true;
        }
      } else {
        // Non-Para portal, using default wallet IDs
        const defaultWalletIds = getDefaultWalletIds(wallets, {
          partnerId,
          supportedWalletTypes: para.supportedWalletTypes,
        });

        if (para.isNoWalletConfig || defaultWalletIds || (isWithoutWallets && !para.ctx.apiKey)) {
          await para.setCurrentWalletIds(defaultWalletIds ?? {}, selectionParams);
          selectionApplied = true;
        }
      }

      // For native apps, persist wallet signers before redirecting
      if (isEnclaveUser || loginRes || selectionApplied) {
        try {
          if (!selectionApplied && para.currentWalletIdsArray.length === 0) {
            console.warn('No wallet selection applied before native redirect; skipping keyshare update');
          } else {
            await (isEnclaveUser ? authUpdateEnclaveKeyShares() : authUpdateKeyShares(loginRes));
          }
        } catch (error) {
          console.error('Failed to update keyshares before native redirect', error);
          return; // Avoid redirecting if we failed to persist signers
        }
      }
      // Redirect to the native callback URL
      const statusParam = auth.isNewUser ? NativeCallbackStatus.NEW_USER : NativeCallbackStatus.COMPLETE;
      const url = new URL(nativeCallbackUrl);
      if (!url.searchParams.has('status')) {
        url.searchParams.set('status', statusParam);
      }
      window.location.href = url.toString();
      return; // Exit early after redirect
    }

    if (auth.isNewUser) {
      // Issue JWT so wallet switching can work
      if (authMethod === 'BASIC_LOGIN') {
        await para.ctx.enclaveClient.issueEnclaveJwt();
      }
      if (!loginCallbackRoute) {
        closeWindow();
        return;
      }
    }

    await para.userSetupAfterLogin();
    const isEnclaveUser = await checkIsEnclaveUser();
    const shouldSkipBasicLoginUpgradePrompt = await getSkipBasicLoginUpgradePromptPreference();

    if (loginCallbackRoute && !isSwitchingWallets) {
      let callbackAdditionalParams: { sessionId?: string } = {};

      switch (loginCallbackRoute) {
        case '/auth/add-new-credential':
          const { sessionLookupId } = await para.touchSession(true);
          await (isEnclaveUser
            ? addAllEnclaveSharesForNewCredential(sessionLookupId)
            : addAllSharesForNewCredential({ loginRes, sessionLookupId }));
          callbackAdditionalParams = { sessionId: sessionLookupId };
          break;
      }

      navigate(loginCallbackRoute, callbackAdditionalParams);
      return;
    }

    if (fromKnownDevice) {
      if (!(await isPasskeySupported())) {
        closeWindow();
        return;
      }
      setStep(AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE);
      return;
    }

    if (!fromBasicLoginUpgrade && !isEnclaveUser && !shouldSkipBasicLoginUpgradePrompt) {
      setStep(AuthLoginStep.BASIC_LOGIN_UPGRADE);
      return;
    }

    const wallets = await fetchWallets();

    const isWithoutWallets = Object.values(wallets).every(arr => arr.length === 0);

    const nextStep = fromKnownDevice ? AuthLoginStep.SUCCESS_FROM_KNOWN_DEVICE : AuthLoginStep.SUCCESS;

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
      await (isEnclaveUser ? authUpdateEnclaveKeyShares() : authUpdateKeyShares(loginRes));

      setStep(nextStep);
      return;
    }

    const defaultWalletIds = getDefaultWalletIds(wallets, { partnerId, supportedWalletTypes: para.supportedWalletTypes });

    // Since we return if the user is new here, we can check if the partner is using basic login here to ensure we create wallets in the correct place
    // This will mainly apply to users who have connected external wallets before and are now using that wallet as an auth method
    const isUsingBasicLogin = isEnclaveUser || partner.supportedAuthMethods?.includes(AuthMethod.BASIC_LOGIN);

    // If the user has no wallets and needs them, create them here is there is no apiKey passed in (legacy flow) OR if they are not an enclave user (those wallets will be created in the core-sdk automatically)
    if (para.isNoWalletConfig || !!defaultWalletIds || (isWithoutWallets && (!para.ctx.apiKey || isUsingBasicLogin))) {
      await para.setCurrentWalletIds(defaultWalletIds ?? {}, {
        sessionLookupId: sessionId,
        needsWallet: isWithoutWallets,
        newDeviceSessionLookupId,
      });
      if (para.currentWalletIdsArray.length > 0) {
        await (isEnclaveUser ? authUpdateEnclaveKeyShares() : authUpdateKeyShares(loginRes));
      }
      setStep(nextStep);
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
    if (step === AuthLoginStep.SELECT_WALLET && !isIFramed) {
      toggleBranding(false);
    } else {
      toggleBranding(true);
    }
  }, [step]);

  // Handle BASIC_LOGIN in wallet switching mode - automatically fetch wallets and go to SELECT_WALLET
  useEffect(() => {
    if (isSwitchingWallets && step === AuthLoginStep.WAITING) {
      postLogin({});
    }
  }, [isSwitchingWallets, authMethod, step, postLogin]);

  useEffect(() => {
    (async function () {
      // Only check passkey support for regular login, not for wallet switching
      if (!isSwitchingWallets && !(await isPasskeySupported()) && authMethod === AuthMethod.PASSKEY) {
        getWebAuthURLForKnownDeviceLogin().then(() => {
          setStep(AuthLoginStep.LOGIN_FAILED);
        });

        return;
      }

      if (
        !!authInfo &&
        sessionId &&
        encryptionKey &&
        !skipAutoLogin &&
        authMethod === AuthMethod.PASSKEY &&
        (step === AuthLoginStep.MANUAL_LOGIN || step === AuthLoginStep.WAITING) &&
        !isAutoLoginAttempted.current
      ) {
        login();
        isAutoLoginAttempted.current = true;
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
        const { url } = await para.getNewCredentialAndUrl({ authMethod: 'PASSKEY', isForNewDevice: true });
        window.location.href = url;
      } else {
        reset();
      }
    } catch (err) {
      console.error('Error adding passkey.', err);
      reset();
    }
  };

  const onBasicLoginUpgradeClick = async () => {
    try {
      const { sessionLookupId } = await para.touchSession(true);
      await addAllSharesForNewCredential({ loginRes: postLoginRes, sessionLookupId });
    } catch (err) {
      console.error('Error setting shares', err);
    }
  };

  const onSkipBasicLoginUpgradeClick = async (shouldSkipPrompt?: boolean) => {
    if (para.userId && shouldSkipPrompt) {
      try {
        await para.ctx.client.updateUserPreferences(para.userId, { shouldSkipBasicLoginUpgradePrompt: true });
        // Ignore error and continue in flow
      } catch (_) {}
    }

    await postLogin({ loginRes: postLoginRes, fromBasicLoginUpgrade: true });
  };

  const onBasicLoginPostLogin = async () => {
    await postLogin({ loginRes: postLoginRes, fromBasicLoginUpgrade: true });
  };

  if (step === AuthLoginStep.SELECT_WALLET) {
    return (
      <SelectWallet
        sessionLookupId={sessionId}
        onSuccess={({ withDelay }) => {
          // Basic login upgrade would have been asked prior to wallet selection, no need to handle that here
          const nextStep = AuthLoginStep.SUCCESS;

          if (withDelay) {
            setTimeout(() => {
              setStep(nextStep);
            }, 1000);
            return;
          }
          setStep(nextStep);
        }}
        isKnownDeviceLogin={isKnownDeviceLogin}
        isSwitchingWallets={isSwitchingWallets}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        {step !== AuthLoginStep.BASIC_LOGIN_UPGRADE && step !== AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING && !isIFramed && (
          <ModalHeader />
        )}
        <Body
          isEmbedded={isIFramed}
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
          postLogin={() => postLogin({})}
          isSwitchingWallets={isSwitchingWallets}
          onBasicLoginUpgradeClick={onBasicLoginUpgradeClick}
          onSkipBasicLoginUpgradeClick={onSkipBasicLoginUpgradeClick}
          onBasicLoginPostLogin={onBasicLoginPostLogin}
        />
      </CardContent>
    </Card>
  );
};

export const AuthLogin = ({
  authMethod,
  step,
  isSwitchingWallets,
}: {
  authMethod?: TAuthMethod;
  step?: AuthLoginStep;
  isSwitchingWallets?: boolean;
}) => (
  <LoginProvider authMethod={authMethod} isSwitchingWallets={isSwitchingWallets}>
    <AuthLoginBase step={step} />
  </LoginProvider>
);
