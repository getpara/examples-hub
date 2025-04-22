import { BiometricHints, formatBiometricHints } from '@getpara/react-common';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
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
  useCreateGuestWallets,
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
import { isExternalWallet, TelegramAuthResponse, VerifiedAuth } from '@getpara/user-management-client';
import { routeMobileExternalWallet } from '../../modal/utils/routeMobileExternalWallet.js';
import { useStore } from '../stores/useStore.js';

type Value = {
  signUpOrLogIn: (_: VerifiedAuth) => void;
  isSignUpOrLogInPending: boolean;
  verifyNewAccount: (_: string) => void;
  isVerifyNewAccountPending: boolean;
  verifyNewAccountError: Error | null;
  verifyOAuth: (_: CoreMethodParams<'verifyOAuth'>['method']) => void;
  verifyFarcaster: () => void;
  verifyTelegram: (_: TelegramAuthResponse) => void;
  onNewAuthState: (_: AuthState) => void;
  presentSignupUi: (_: AuthMethod, __: AuthStateSignup) => void;
  presentLoginUi: (_: AuthMethod, __: AuthStateLogin) => void;
  isSetup2faPending: boolean;
  createGuestWallets: () => void;
  isCreateGuestWalletsPending: boolean;
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
  signUpOrLogIn: () => {},
  isSignUpOrLogInPending: false,
  verifyNewAccount: () => {},
  isVerifyNewAccountPending: false,
  verifyNewAccountError: null,
  verifyOAuth: () => {},
  verifyFarcaster: () => {},
  verifyTelegram: () => {},
  onNewAuthState: () => {},
  isSetup2faPending: false,
  presentSignupUi: () => {},
  presentLoginUi: () => {},
  createGuestWallets: () => {},
  isCreateGuestWalletsPending: false,
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
  const setIsOpen = useStore(state => state.setIsOpen);
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
  const authStepRoute = useModalStore(state => state.authStepRoute);
  const isIFrameReady = useModalStore(state => state.isIFrameReady);

  const goBack = useGoBack();
  const biometricHints = useMemo(() => formatBiometricHints(loginState?.biometricHints ?? []), [loginState?.biometricHints]);

  const { mutate: mutateSignUpOrLogIn, isPending: isSignUpOrLogInPending } = useSignUpOrLogIn();
  const {
    mutate: mutateVerifyNewAccount,
    isPending: isVerifyNewAccountPending,
    error: verifyNewAccountError,
  } = useVerifyNewAccount();
  const { mutate: mutateVerifyOAuth } = useVerifyOAuth();
  const { mutate: mutateVerifyFarcaster } = useVerifyFarcaster();
  const { mutate: mutateVerifyTelegram } = useVerifyTelegram();
  const { mutate: mutateWaitForLogin } = useWaitForLogin();
  const { mutate: mutateWaitForSignup } = useWaitForSignup();
  const { mutateAsync: mutateAsyncWaitForWalletCreation } = useWaitForWalletCreation();
  const { mutate: mutateSetup2fa, isPending: isSetup2faPending } = useSetup2fa();
  const { mutate: mutateCreateGuestWallets, isPending: isCreateGuestWalletsPending } = useCreateGuestWallets();
  const { mutate: mutateLogout } = useLogout();

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
          mutateWaitForSignup(
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
                if (para.isNoWalletConfig) {
                  onLoginComplete({
                    on2faSetupOrError: () => setStep(ModalStep.LOGIN_DONE),
                    on2faNotSetup: () => setStep(ModalStep.SETUP_2FA),
                  });
                } else {
                  createWallets();
                }
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
        mutateWaitForLogin(
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
              if (needsWallet && !para.isNoWalletConfig) {
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
    mutateSignUpOrLogIn(
      { auth, useShortUrls: true },
      {
        onSuccess: onNewAuthState,
      },
    );
  };

  const verifyNewAccount = async (verificationCode: string) => {
    mutateVerifyNewAccount(
      { verificationCode },
      {
        onSuccess: onNewAuthState,
      },
    );
  };

  const verifyOAuth = async (method: CoreMethodParams<'verifyOAuth'>['method']) => {
    setStep(ModalStep.AWAITING_OAUTH);

    mutateVerifyOAuth(
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

    mutateVerifyFarcaster(
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
    mutateVerifyTelegram(
      {
        telegramAuthResponse,
        useShortUrls: true,
      },
      {
        onSuccess: onNewAuthState,
      },
    );
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
        mutateSetup2fa(undefined, {
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
        ({ recoverySecret, walletIds } = await mutateAsyncWaitForWalletCreation({
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
  }, [para, isRecoverySecretStepEnabled, overrides?.createWallets]);

  const createGuestWallets = () => {
    setIsOpen(false);

    mutateCreateGuestWallets(undefined, {
      onSuccess: () => {},
      onSettled: () => {},
    });
  };

  const logout = () => {
    mutateLogout();
  };

  const isPasswordIFrameLoading = !!iFrameUrl && iFrameUrl === signupState?.passwordUrl && !isIFrameReady;

  const value = useMemo<Value>(
    () => ({
      presentSignupUi,
      presentLoginUi,
      signUpOrLogIn,
      isSignUpOrLogInPending,
      verifyNewAccount,
      isVerifyNewAccountPending: isVerifyNewAccountPending || isPasswordIFrameLoading,
      verifyNewAccountError,
      verifyOAuth,
      verifyFarcaster,
      verifyTelegram,
      onNewAuthState,
      isSetup2faPending,
      createGuestWallets,
      isCreateGuestWalletsPending,
      logout,
      biometricHints,
    }),
    [
      presentSignupUi,
      presentLoginUi,
      signUpOrLogIn,
      isSignUpOrLogInPending,
      verifyNewAccount,
      isVerifyNewAccountPending,
      isPasswordIFrameLoading,
      verifyNewAccountError,
      verifyOAuth,
      verifyFarcaster,
      verifyTelegram,
      onNewAuthState,
      isSetup2faPending,
      createGuestWallets,
      isCreateGuestWalletsPending,
      logout,
      biometricHints,
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
    if (refs.currentStep.current === ModalStep.AWAITING_GUEST_WALLET_CREATION && !isCreateGuestWalletsPending) {
      setStep(ModalStep.ACCOUNT_MAIN);
    }
  }, [isCreateGuestWalletsPending]);

  useEffect(() => {
    return () => {
      window?.clearTimeout(refs.poll.current?.timeout);
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthActions = () => useContext(AuthContext);
