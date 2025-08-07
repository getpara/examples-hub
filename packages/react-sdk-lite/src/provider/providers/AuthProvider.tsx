import { BiometricHints, useUserAgent } from '@getpara/react-common';
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
  getPortalBaseURL,
} from '@getpara/web-sdk';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { ParaModalProps } from '../../modal/types/modalProps.js';
import { useGoBack } from '../../modal/hooks/useGoBack.js';
import { isExternalWallet, TelegramAuthResponse, VerifiedAuth } from '@getpara/user-management-client';
import { routeMobileExternalWallet } from '../../modal/utils/routeMobileExternalWallet.js';
import { useStore } from '../stores/useStore.js';
import { useFormattedBiometricHints } from '../hooks/utils/useFormattedBiometricHints.js';
import { MutationStatus, useQueryClient } from '@tanstack/react-query';

type Value = {
  signUpOrLogIn: (_: VerifiedAuth) => void;
  isSignUpOrLogInPending: boolean;
  verifyNewAccount: (_: string) => void;
  verifyNewAccountStatus: MutationStatus;
  verifyNewAccountError: Error | null;
  verifyOAuth: (_: CoreMethodParams<'verifyOAuth'>['method']) => void;
  verifyFarcaster: () => void;
  verifyTelegram: (_: TelegramAuthResponse) => void;
  verifyTelegramStatus: MutationStatus;
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
  verifyNewAccountStatus: 'idle',
  verifyNewAccountError: null,
  verifyOAuth: () => {},
  verifyFarcaster: () => {},
  verifyTelegram: () => {},
  verifyTelegramStatus: 'idle',
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
  const queryClient = useQueryClient();
  const para = useInternalClient();
  const userAgent = useUserAgent();
  const onLoginRef = useStore(state => state.onLoginRef);
  const setIsOpen = useStore(state => state.setIsOpen);
  const bareModal = useStore(state => state.modalConfig?.bareModal);
  const refs = useModalStore(state => state.refs);
  const setFlow = useModalStore(state => state.setFlow);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const setAuthStepRoute = useModalStore(state => state.setAuthStepRoute);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
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

  const { signUpOrLogIn: mutateSignUpOrLogIn, isPending: isSignUpOrLogInPending } = useSignUpOrLogIn();
  const {
    verifyNewAccount: mutateVerifyNewAccount,
    status: verifyNewAccountStatus,
    error: verifyNewAccountError,
  } = useVerifyNewAccount();
  const { verifyOAuth: mutateVerifyOAuth } = useVerifyOAuth();
  const { verifyFarcaster: mutateVerifyFarcaster } = useVerifyFarcaster();
  const { verifyTelegram: mutateVerifyTelegram, status: verifyTelegramStatus } = useVerifyTelegram();
  const { waitForLogin: mutateWaitForLogin } = useWaitForLogin();
  const { waitForSignup: mutateWaitForSignup } = useWaitForSignup();
  const { waitForWalletCreationAsync: mutateAsyncWaitForWalletCreation } = useWaitForWalletCreation();
  const { setup2fa: mutateSetup2fa, isPending: isSetup2faPending } = useSetup2fa();
  const { createGuestWallets: mutateCreateGuestWallets, isPending: isCreateGuestWalletsPending } = useCreateGuestWallets();
  const { logout: mutateLogout } = useLogout();
  const { data: biometricHints } = useFormattedBiometricHints();

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

  const setupListener = () => {
    window.addEventListener('message', function handleMessage(event) {
      const portalBase = getPortalBaseURL(para.ctx);

      if (!event.origin.startsWith(portalBase)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data?.type === 'CLOSE_WINDOW') {
        // Handle your event
        if (event.data.success) {
          setAuthStepRoute();
          setIFrameUrl();
          setIsIFrameReady(false);
          setStep(ModalStep.AWAITING_IFRAME);
        }
        // Remove the listener after handling the matching event
        window.removeEventListener('message', handleMessage);
      }
    });
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
                  ModalStep.AWAITING_IFRAME,
                  ModalStep.VERIFICATIONS,
                  ModalStep.AWAITING_OAUTH,
                  ModalStep.EXTERNAL_WALLET_VERIFICATION,
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
                  [ModalStep.AWAITING_BIOMETRIC_CREATION, ModalStep.PASSWORD_CREATION, ModalStep.AWAITING_IFRAME].includes(
                    refs.currentStep.current,
                  )
                ) {
                  goBack();
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
          setupListener();

          if (isIFrameReady) {
            setStep(ModalStep.PASSWORD_CREATION);
          } else {
            setIFrameUrl(authState.passwordUrl!);
            setIsIFrameReady(false);
            setAuthStepRoute(ModalStep.PASSWORD_CREATION);
          }
          break;
        case AuthMethod.PIN:
          setupListener();

          if (isIFrameReady) {
            setStep(ModalStep.PASSWORD_CREATION);
          } else {
            setIFrameUrl(authState.pinUrl!);
            setIsIFrameReady(false);
            setAuthStepRoute(ModalStep.PASSWORD_CREATION);
          }
          break;
      }
    },
    [isIFrameReady],
  );

  const login = (authState: AuthStateLogin) => {
    if (authState.isWalletSelectionNeeded || authState.passkeyUrl) {
      setStep(ModalStep.BIOMETRIC_LOGIN);
    } else {
      setupListener();

      setIFrameUrl(authState.passwordUrl! || authState.pinUrl!);
      setIsIFrameReady(false);
      setStep(ModalStep.EMBEDDED_PASSWORD_LOGIN);
    }

    refs.poll.current = {
      action: 'login',
      timeout: window?.setTimeout(async () => {
        mutateWaitForLogin(
          {
            isCanceled: () =>
              cancelIfExitedSteps([
                ModalStep.BIOMETRIC_LOGIN,
                ModalStep.EMBEDDED_PASSWORD_LOGIN,
                ModalStep.AWAITING_BIOMETRIC_LOGIN,
                ModalStep.AWAITING_PASSWORD_LOGIN,
                ModalStep.AWAITING_IFRAME,
              ]),
            onPoll: () => {
              goBackIfPopupClosedOnSteps([
                ModalStep.AWAITING_BIOMETRIC_LOGIN,
                ModalStep.AWAITING_PASSWORD_LOGIN,
                ModalStep.EMBEDDED_PASSWORD_LOGIN,
              ]);
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
      const isPassword = method === AuthMethod.PASSWORD,
        isPIN = method === AuthMethod.PIN;

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
        url: isPIN ? authState.pinUrl! : isPassword ? authState.passwordUrl! : authState.passkeyUrl!,
        target: isPIN ? 'ParaPIN' : isPassword ? 'ParaPassword' : 'ParaPasskey',
        type: isPIN ? 'LOGIN_PASSWORD' : isPassword ? 'LOGIN_PASSWORD' : 'LOGIN_PASSKEY',
        current: refs.popupWindow.current,
      });

      setStep(isPassword || isPIN ? ModalStep.AWAITING_PASSWORD_LOGIN : ModalStep.AWAITING_BIOMETRIC_LOGIN);
    },
    [loginState, biometricHints],
  );

  const onNewAuthState = async (authState: AuthState) => {
    refs.popupWindow.current = null;
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
        if (authState.pinUrl && authState.signatureVerificationMessage) {
          setStep(ModalStep.EXTERNAL_WALLET_VERIFICATION);
        } else {
          login(authState);
        }

        break;
      case 'signup':
        {
          const isPassword = !!authState.passwordUrl,
            isPIN = !!authState.pinUrl,
            isPasswordOrPIN = isPassword || isPIN,
            isPasswordOrPINOnly =
              isPasswordOrPIN &&
              (!authState.passkeyUrl || (userAgent?.device.type === 'mobile' && !authState.isPasskeySupported));

          if (isPasswordOrPIN) {
            setIFrameUrl(authState.passwordUrl || authState.pinUrl);
            setIsIFrameReady(false);
          }

          signup();

          if (isPasswordOrPINOnly) {
            presentSignupUi(isPassword ? AuthMethod.PASSWORD : AuthMethod.PIN, authState);
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
      { verificationCode, useShortUrls: true },
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
        onOAuthPopup: oAuthPopup => {
          refs.popupWindow.current = oAuthPopup;
        },
        isCanceled: () => refs.popupWindow.current?.closed || cancelIfExitedSteps([ModalStep.AWAITING_OAUTH]),
        onPoll: () => {
          goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);
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
      await queryClient.invalidateQueries({ queryKey: ['isFullyLoggedIn'] });

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
    if (bareModal) {
      setFlow('guest');
      setStep(ModalStep.AWAITING_GUEST_WALLET_CREATION);
    } else {
      setIsOpen(false);
    }

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
      verifyNewAccountStatus: isPasswordIFrameLoading ? 'pending' : verifyNewAccountStatus,
      verifyNewAccountError,
      verifyOAuth,
      verifyFarcaster,
      verifyTelegram,
      verifyTelegramStatus,
      onNewAuthState,
      isSetup2faPending,
      createGuestWallets,
      isCreateGuestWalletsPending,
      logout,
      biometricHints: biometricHints || undefined,
    }),
    [
      presentSignupUi,
      presentLoginUi,
      signUpOrLogIn,
      isSignUpOrLogInPending,
      verifyNewAccount,
      verifyNewAccountStatus,
      isPasswordIFrameLoading,
      verifyNewAccountError,
      verifyOAuth,
      verifyFarcaster,
      verifyTelegram,
      verifyTelegramStatus,
      onNewAuthState,
      isSetup2faPending,
      createGuestWallets,
      isCreateGuestWalletsPending,
      logout,
      biometricHints,
    ],
  );

  useEffect(() => {
    if (!!authStepRoute && refs.currentStep.current !== authStepRoute) {
      // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
      setTimeout(() => {
        setStep(authStepRoute);
      }, 200);
    }
  }, [authStepRoute]);

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
