import { BiometricHints, formatBiometricHints } from '@getpara/react-common';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useModalStore } from '../../modal/stores/index.js';
import { ModalStep } from '../../modal/utils/steps.js';
import {
  useSignUpOrLogIn,
  useVerifyNewAccount,
  useWaitForSignup,
  useWaitForLogin,
  useWaitForWalletCreation,
  useVerifyOAuth,
  useVerifyFarcaster,
  useVerifyTelegram,
  useSetup2fa,
  useLogout,
  useVerifyExternalWallet,
} from '../index.js';
import { DEFAULTS } from '../../modal/constants/defaults.js';
import { openPopup } from '../../modal/utils/openPopup.js';
import {
  AuthMethod,
  CoreMethodParams,
  CurrentWalletIds,
  entityToWallet,
  Wallet,
  AuthState,
  AuthStateSignup,
  AuthStateLogin,
} from '@getpara/web-sdk';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { ParaModalProps } from '../../modal/types/modalProps.js';
import { useGoBack } from '../../modal/hooks/useGoBack.js';
import {
  isExternalWallet,
  TelegramAuthResponse,
  VerifiedAuth,
  VerifyExternalWalletParams,
} from '@getpara/user-management-client';
import { routeMobileExternalWallet } from '../../modal/utils/routeMobileExternalWallet.js';
import { useStore } from '../stores/useStore.js';

type Value = {
  signUpOrLogIn: [(_: VerifiedAuth) => void, boolean];
  verifyNewAccount: [(_: string) => void, boolean, Error | null];
  verifyOAuth: (_: CoreMethodParams<'verifyOAuthV2'>['method']) => void;
  verifyFarcaster: () => void;
  verifyTelegram: (_: TelegramAuthResponse) => void;
  verifyExternalWallet: (_: VerifyExternalWalletParams) => void;
  onNewAuthState: (_: AuthState) => void;
  presentSignupUi: (_: AuthMethod, __: AuthStateSignup) => void;
  presentLoginUi: (_: AuthMethod, __: AuthStateLogin) => void;
  setup2fa: [boolean];
  logout: () => void;
  biometricHints?: BiometricHints;
};

type Props = PropsWithChildren<{
  is2faEnabled?: boolean;
  isRecoverySecretStepEnabled?: boolean;
  overrides?: {
    login?: ParaModalProps['loginTransitionOverride'];
    createWallets?: ParaModalProps['createWalletOverride'];
  };
}>;

export const AuthContext = createContext<Value>({
  signUpOrLogIn: [() => {}, false],
  verifyNewAccount: [() => {}, false, null],
  verifyOAuth: () => {},
  verifyFarcaster: () => {},
  verifyTelegram: () => {},
  verifyExternalWallet: () => {},
  onNewAuthState: () => {},
  setup2fa: [false],
  presentSignupUi: () => {},
  presentLoginUi: () => {},
  logout: () => {},
});

export function AuthProvider({
  children,
  is2faEnabled = false,
  isRecoverySecretStepEnabled = false,
  overrides = {},
}: Props) {
  const para = useInternalClient();
  const onLoginRef = useStore(state => state.onLoginRef);
  const refs = useModalStore(state => state.refs);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const setAuthStepRoute = useModalStore(state => state.setAuthStepRoute);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const loginState = useModalStore(state => state.getLoginState());
  const signupState = useModalStore(state => state.getSignupState());
  const setAuthState = useModalStore(state => state.setAuthState);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);
  const setTwoFactorStatus = useModalStore(state => state.setTwoFactorStatus);
  const setRecoveryShare = useModalStore(state => state.setRecoveryShare);
  const setExternalWalletError = useModalStore(state => state.setExternalWalletError);
  const authStepRoute = useModalStore(state => state.authStepRoute);
  const isIFrameReady = useModalStore(state => state.isIFrameReady);

  const goBack = useGoBack();
  const biometricHints = useMemo(() => formatBiometricHints(loginState?.biometricHints ?? []), [loginState?.biometricHints]);

  const signUpOrLogInHook = useSignUpOrLogIn();
  const verifyNewAccountHook = useVerifyNewAccount();
  const verifyOAuthHook = useVerifyOAuth();
  const verifyFarcasterHook = useVerifyFarcaster();
  const verifyTelegramHook = useVerifyTelegram();
  const verifyExternalWalletHook = useVerifyExternalWallet();
  const waitForLoginHook = useWaitForLogin();
  const waitForSignupHook = useWaitForSignup();
  const waitForWalletCreationHook = useWaitForWalletCreation();
  const setup2faHook = useSetup2fa();
  const logoutHook = useLogout();

  const [isVerifyExternalWalletPending, setIsVerifyExternalWalletPending] = useState(false);

  const goBackIfPopupClosedOnSteps = (steps: ModalStep[]) => {
    if (refs.popupWindow.current?.closed && (!refs.currentStep.current || steps.includes(refs.currentStep.current))) {
      refs.popupWindow.current = null;
      goBack();
    }
  };

  const cancelIfExitedSteps = (steps: ModalStep[]): boolean => {
    const stepNow = refs.currentStep.current;
    return !!stepNow && !steps.includes(stepNow);
  };

  const signup = () => {
    if (typeof window !== 'undefined') {
      refs.poll.current = {
        action: 'signup',
        timeout: window?.setTimeout(async () => {
          waitForSignupHook.mutate(
            {
              isCanceled: () =>
                cancelIfExitedSteps([
                  ModalStep.BIOMETRIC_CREATION,
                  ModalStep.AWAITING_BIOMETRIC_CREATION,
                  ModalStep.PASSWORD_CREATION,
                ]),
              onPoll: () => {
                goBackIfPopupClosedOnSteps([ModalStep.AWAITING_BIOMETRIC_CREATION]);
              },
            },
            {
              onSuccess: () => {
                createWallets();
              },
              onError: () => {
                if (
                  refs.currentStep.current &&
                  [ModalStep.AWAITING_BIOMETRIC_CREATION, ModalStep.PASSWORD_CREATION].includes(refs.currentStep.current)
                ) {
                  setStep(ModalStep.BIOMETRIC_CREATION);
                }
              },
              onSettled: () => {
                window?.clearTimeout(refs.poll.current?.timeout);
                refs.poll.current = null;
                refs.popupWindow.current = null;
              },
            },
          );
        }, DEFAULTS.POLLING_INTERVAL_MS),
      };
    }
  };

  const presentSignupUi = useCallback(
    (method: AuthMethod, authState: AuthStateSignup) => {
      switch (method) {
        case AuthMethod.PASSKEY:
          if (refs.currentStep.current !== ModalStep.AWAITING_BIOMETRIC_CREATION) {
            setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
          }

          refs.popupWindow.current = openPopup({
            url: authState.passkeyUrl!,
            target: 'ParaPasskey',
            type: 'CREATE_PASSKEY',
            current: refs.popupWindow.current,
          });
          break;
        case AuthMethod.PASSWORD:
          if (isIFrameReady) {
            setStep(ModalStep.PASSWORD_CREATION);
          } else {
            setIFrameUrl(authState.passwordUrl!);
            setAuthStepRoute(ModalStep.PASSWORD_CREATION);
          }
          break;
      }
    },
    [isIFrameReady],
  );

  const login = () => {
    setStep(ModalStep.BIOMETRIC_LOGIN);

    refs.poll.current = {
      action: 'login',
      timeout: window?.setTimeout(async () => {
        waitForLoginHook.mutate(
          {
            isCanceled: () =>
              cancelIfExitedSteps([
                ModalStep.BIOMETRIC_LOGIN,
                ModalStep.AWAITING_BIOMETRIC_LOGIN,
                ModalStep.AWAITING_PASSWORD_LOGIN,
              ]),
            onPoll: () => {
              goBackIfPopupClosedOnSteps([ModalStep.AWAITING_BIOMETRIC_LOGIN, ModalStep.AWAITING_PASSWORD_LOGIN]);
            },
          },
          {
            onSuccess: ({ needsWallet }) => {
              if (needsWallet) {
                createWallets();
              } else {
                onLoginComplete({
                  on2faSetupOrError: () => setStep(ModalStep.LOGIN_DONE),
                  on2faNotSetup: () => setStep(ModalStep.SETUP_2FA),
                });
              }
            },
            onSettled: () => {
              window?.clearTimeout(refs.poll.current?.timeout);
              refs.poll.current = null;
              refs.popupWindow.current = null;
            },
          },
        );
      }, DEFAULTS.LOGGIN_POLLING_DELAY_MS),
    };
  };

  const presentLoginUi = useCallback(
    (method: AuthMethod, authState: AuthStateLogin) => {
      const isPasskey = method === AuthMethod.PASSKEY,
        isPassword = !isPasskey;

      if (overrides.login) {
        async function loginOverride() {
          await overrides?.login?.(para);

          await onLoginRef.current?.();

          await onLoginComplete();
        }
        loginOverride();
        return;
      }

      refs.popupWindow.current = openPopup({
        url: isPassword ? authState.passwordUrl! : authState.passkeyUrl!,
        target: isPassword ? 'ParaPassword' : 'ParaPasskey',
        type: isPassword ? 'LOGIN_PASSWORD' : 'LOGIN_PASSKEY',
        current: refs.popupWindow.current,
      });

      setStep(isPassword ? ModalStep.AWAITING_PASSWORD_LOGIN : ModalStep.AWAITING_BIOMETRIC_LOGIN);
    },
    [loginState, biometricHints],
  );

  const onNewAuthState = async (authState: AuthState) => {
    setAuthState(authState);

    switch (authState.stage) {
      case 'verify':
        if (isExternalWallet(authState.auth) && authState.signatureVerificationMessage) {
          setStep(ModalStep.EXTERNAL_WALLET_VERIFICATION);
        } else {
          setStep(ModalStep.VERIFICATIONS);
        }
        break;
      case 'login':
        login();
        break;
      case 'signup':
        {
          const isPassword = !!authState.passwordUrl,
            isPasswordOnly = isPassword && !authState.passkeyUrl;

          if (isPassword) {
            setIFrameUrl(authState.passwordUrl!);
          }

          signup();

          if (isPasswordOnly) {
            presentSignupUi(AuthMethod.PASSWORD, authState);
          } else {
            setStep(ModalStep.BIOMETRIC_CREATION);
          }
        }
        break;
    }
  };

  const signUpOrLogIn = async (auth: VerifiedAuth) => {
    signUpOrLogInHook.mutate(
      { auth, useShortUrls: true },
      {
        onSuccess: onNewAuthState,
      },
    );
  };

  const verifyNewAccount = async (verificationCode: string) => {
    verifyNewAccountHook.mutate(
      { verificationCode },
      {
        onSuccess: onNewAuthState,
      },
    );
  };

  const verifyOAuth = async (method: CoreMethodParams<'verifyOAuthV2'>['method']) => {
    setStep(ModalStep.AWAITING_OAUTH);

    verifyOAuthHook.mutate(
      {
        method,
        isCanceled: () => refs.popupWindow.current?.closed || cancelIfExitedSteps([ModalStep.AWAITING_OAUTH]),
        onPoll: () => {
          goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);
        },
        onOAuthUrl: oAuthUrl => {
          refs.popupWindow.current = openPopup({
            url: oAuthUrl,
            target: `${method}AuthPopup`,
            type: 'OAUTH',
            current: refs.popupWindow.current,
          });
        },
        useShortUrls: true,
      },
      {
        onSuccess: onNewAuthState,
        onError: () => {
          goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);
        },
      },
    );
  };

  const verifyFarcaster = async () => {
    setStep(ModalStep.FARCASTER_OAUTH);

    verifyFarcasterHook.mutate(
      {
        isCanceled: () => refs.currentStep.current !== ModalStep.FARCASTER_OAUTH,
        onConnectUri: connectUri => {
          setFarcasterConnectUri(connectUri);
          routeMobileExternalWallet(connectUri);
        },
        useShortUrls: true,
      },
      {
        onSuccess: onNewAuthState,
        onError: () => {
          if (refs.currentStep.current === ModalStep.FARCASTER_OAUTH) {
            goBack();
          }
        },
      },
    );
  };

  const verifyTelegram = async (telegramAuthResponse: TelegramAuthResponse) => {
    verifyTelegramHook.mutate(
      {
        telegramAuthResponse,
        useShortUrls: true,
      },
      {
        onSuccess: onNewAuthState,
      },
    );
  };

  const verifyExternalWallet = async (verifyParams: VerifyExternalWalletParams) => {
    setIsVerifyExternalWalletPending(true);
    setExternalWalletError(undefined);

    if (!verifyParams?.externalWallet || !verifyParams?.signedMessage) {
      console.error('No signature or address found on the verifyWalletSignature response.');
      setIsVerifyExternalWalletPending(false);
      return;
    }

    verifyExternalWalletHook.mutate(verifyParams, {
      onSuccess: onNewAuthState,
      onError: e => {
        console.error('Error verifying signature:', e);
        setExternalWalletError(['Signature verification failed.']);
      },
      onSettled: () => {
        setIsVerifyExternalWalletPending(false);
      },
    });
  };

  const onLoginComplete = useCallback(
    async ({
      on2faSetupOrError,
      on2faNotSetup,
    }: {
      on2faSetupOrError?: () => void;
      on2faNotSetup?: () => void;
    } = {}) => {
      setAuthState();

      await onLoginRef.current?.();

      if (is2faEnabled) {
        setup2faHook.mutate(undefined, {
          onSuccess: status => {
            setTwoFactorStatus(status);

            if (!status.isSetup && !!status.uri) {
              on2faNotSetup?.();
            } else {
              on2faSetupOrError?.();
            }
          },
          onError: () => {
            on2faSetupOrError?.();
          },
        });
      } else {
        on2faSetupOrError?.();
      }
    },
    [is2faEnabled],
  );

  const createWallets = useCallback(async () => {
    if (refs.currentStep.current !== ModalStep.AWAITING_WALLET_CREATION) {
      setStep(ModalStep.AWAITING_WALLET_CREATION);
    }

    let recoverySecret: string | undefined, walletIds: CurrentWalletIds | undefined;

    try {
      if (overrides.createWallets) {
        ({ recoverySecret, walletIds } = await overrides?.createWallets?.(para));
        const fetchedWallets = (await para.fetchWallets()).filter(wallet => !!wallet.address);
        const newWallets: Record<string, Wallet> = {};
        for (const wallet of fetchedWallets) {
          newWallets[wallet.id] = {
            ...entityToWallet(wallet),
            signer: '',
          };
        }
        para.setWallets(newWallets);
      } else {
        ({ recoverySecret, walletIds } = await waitForWalletCreationHook.mutateAsync({
          isCanceled: () => false,
        }));
      }

      if (walletIds) {
        await para.setCurrentWalletIds(walletIds);
      }

      if (recoverySecret && isRecoverySecretStepEnabled) {
        setRecoveryShare(recoverySecret);
      }

      setStep(recoverySecret && isRecoverySecretStepEnabled ? ModalStep.SECRET : ModalStep.WALLET_CREATION_DONE);

      onLoginComplete();
    } catch (e) {}
  }, [isRecoverySecretStepEnabled, overrides?.createWallets]);

  const logout = () => {
    logoutHook.mutate();
  };

  const isPasswordIFrameLoading = !!iFrameUrl && iFrameUrl === signupState?.passwordUrl && !isIFrameReady;

  const value = useMemo<Value>(
    () => ({
      presentSignupUi,
      presentLoginUi,
      signUpOrLogIn: [signUpOrLogIn, signUpOrLogInHook.isPending],
      verifyNewAccount: [
        verifyNewAccount,
        verifyNewAccountHook.isPending || isPasswordIFrameLoading,
        verifyNewAccountHook.error,
      ],
      verifyOAuth,
      verifyFarcaster,
      verifyTelegram,
      verifyExternalWallet,
      onNewAuthState,
      setup2fa: [setup2faHook.isPending],
      logout,
      biometricHints,
    }),
    [
      signupState,
      presentSignupUi,
      presentLoginUi,
      signUpOrLogIn,
      verifyNewAccount,
      signUpOrLogIn,
      verifyTelegram,
      verifyFarcaster,
      onNewAuthState,
      verifyExternalWallet,
      biometricHints,
      isVerifyExternalWalletPending,
      isPasswordIFrameLoading,
      verifyNewAccountHook.isPending,
      verifyNewAccountHook.error,
      signUpOrLogInHook.isPending,
    ],
  );

  useEffect(() => {
    if (!!authStepRoute && isIFrameReady && refs.currentStep.current !== authStepRoute) {
      // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
      setTimeout(() => {
        setStep(authStepRoute);
      }, 200);
    }
  }, [authStepRoute, isIFrameReady]);

  useEffect(() => {
    refs.currentStep.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    return () => {
      window?.clearTimeout(refs.poll.current?.timeout);
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthActions = () => useContext(AuthContext);
