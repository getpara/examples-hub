import { BiometricHints, openMobileUrl, useUserAgent } from '@getpara/react-common';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  useWalletState,
} from '../index.js';
import { useSwitchWallets } from '../hooks/mutations/useSwitchWallets.js';
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
  AuthStateVerify,
  isMobile,
} from '@getpara/web-sdk';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { ParaModalProps } from '../../modal/types/modalProps.js';
import { useGoBack } from '../../modal/hooks/useGoBack.js';
import { isExternalWallet, VerifiedAuth, VerifyThirdPartyAuth } from '@getpara/user-management-client';
import { useStore } from '../stores/useStore.js';
import { useFormattedBiometricHints } from '../hooks/utils/useFormattedBiometricHints.js';
import { MutationStatus, useQueryClient } from '@tanstack/react-query';
import { validatePortalOrigin } from '../../modal/utils/validatePortalOrigin.js';

type Value = {
  signUpOrLogIn: (_: VerifiedAuth) => void;
  isSignUpOrLogInPending: boolean;
  verifyNewAccount: (_: string) => void;
  verifyNewAccountStatus: MutationStatus;
  verifyNewAccountError: Error | null;
  verifyOAuth: (_: CoreMethodParams<'verifyOAuth'>['method']) => void;
  verifyFarcaster: (_?: VerifyThirdPartyAuth) => void;
  verifyTelegram: (_: VerifyThirdPartyAuth) => void;
  verifyTelegramStatus: MutationStatus;
  verifyFarcasterStatus: MutationStatus;
  onNewAuthState: (_: AuthState) => void;
  presentSignupUi: (_: AuthMethod, __: AuthStateSignup) => void;
  presentLoginUi: (_: AuthMethod, __: AuthStateLogin) => void;
  presentVerifyUi: (_: AuthMethod, __: AuthStateVerify) => void;
  isSetup2faPending: boolean;
  createGuestWallets: () => void;
  isCreateGuestWalletsPending: boolean;
  logout: () => void;
  switchWallets: (authMethod?: string) => void;
  switchWalletsUrl: string | undefined;
  setSwitchWalletsUrl: (_: string) => void;
  isSwitchWalletsPending: boolean;
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
  verifyFarcasterStatus: 'idle',
  onNewAuthState: () => {},
  isSetup2faPending: false,
  presentSignupUi: () => {},
  presentLoginUi: () => {},
  presentVerifyUi: () => {},
  createGuestWallets: () => {},
  isCreateGuestWalletsPending: false,
  logout: () => {},
  switchWallets: () => {},
  switchWalletsUrl: undefined,
  setSwitchWalletsUrl: () => {},
  isSwitchWalletsPending: false,
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
  const { verifyFarcaster: mutateVerifyFarcaster, status: verifyFarcasterStatus } = useVerifyFarcaster();
  const { verifyTelegram: mutateVerifyTelegram, status: verifyTelegramStatus } = useVerifyTelegram();
  const { waitForLogin: mutateWaitForLogin } = useWaitForLogin();
  const { waitForSignup: mutateWaitForSignup } = useWaitForSignup();
  const { waitForWalletCreationAsync: mutateAsyncWaitForWalletCreation } = useWaitForWalletCreation();
  const { switchWallets: mutateSwitchWallets, isPending: mutateIsSwitchWalletsPending } = useSwitchWallets();
  const { setup2fa: mutateSetup2fa, isPending: isSetup2faPending } = useSetup2fa();
  const { createGuestWallets: mutateCreateGuestWallets, isPending: isCreateGuestWalletsPending } = useCreateGuestWallets();
  const { logout: mutateLogout } = useLogout();
  const { updateSelectedWallet } = useWalletState();
  const { data: biometricHints } = useFormattedBiometricHints();
  const [switchWalletsUrl, setSwitchWalletsUrl] = useState<string | undefined>(undefined);
  const [isSwitchWalletsPending, setIsSwitchWalletsPending] = useState(mutateIsSwitchWalletsPending);

  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

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
    // Remove any existing listener first
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
    }

    // Create the handler function
    const handleMessage = (event: MessageEvent) => {
      if (!validatePortalOrigin(event, para.ctx)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data?.type === 'CLOSE_WINDOW') {
        // Handle your event
        if (event.data.success) {
          setAuthStepRoute();
          setIFrameUrl();
          setIsIFrameReady(false);

          if (refs.currentStep.current !== ModalStep.LOGIN_DONE && refs.currentStep.current !== ModalStep.AWAITING_ACCOUNT) {
            setStep(ModalStep.AWAITING_ACCOUNT);
          }
        }
        // Remove the listener after handling the matching event
        window.removeEventListener('message', handleMessage);
        messageHandlerRef.current = null;
      }
    };

    // Store the handler reference and add the listener
    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);
  };

  const pollSignup = () => {
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
                  ModalStep.AWAITING_ACCOUNT,
                  ModalStep.VERIFICATIONS,
                  ModalStep.AWAITING_OAUTH,
                  ModalStep.EXTERNAL_WALLET_VERIFICATION,
                  ModalStep.OTP,
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
                  [ModalStep.AWAITING_BIOMETRIC_CREATION, ModalStep.PASSWORD_CREATION, ModalStep.AWAITING_ACCOUNT].includes(
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

          if (typeof window !== 'undefined') {
            refs.popupWindow.current = openPopup({
              url: authState.passkeyUrl!,
              target: 'ParaPasskey',
              type: 'CREATE_PASSKEY',
              current: refs.popupWindow.current,
            });
          }
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

  const presentVerifyUi = useCallback(
    (method: AuthMethod, authState: AuthStateVerify) => {
      switch (method) {
        case AuthMethod.BASIC_LOGIN:
          setupListener();

          if (isIFrameReady) {
            setStep(ModalStep.OTP);
          } else {
            setIFrameUrl(authState.loginUrl);
            setIsIFrameReady(false);
            setAuthStepRoute(ModalStep.OTP);
          }
          break;
      }
    },
    [isIFrameReady],
  );

  const login = (authState: AuthStateLogin) => {
    const hasPasskey = !!authState.passkeyUrl;

    if (!hasPasskey) {
      setupListener();

      setIFrameUrl(authState.passwordUrl! || authState.pinUrl!);
      setIsIFrameReady(false);
      setStep(ModalStep.EMBEDDED_PASSWORD_LOGIN);
    } else {
      setStep(ModalStep.BIOMETRIC_LOGIN);
    }

    pollLogin();
  };

  const pollLogin = () => {
    if (typeof window !== 'undefined') {
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
                  ModalStep.AWAITING_ACCOUNT,
                  ModalStep.OTP,
                  ModalStep.FARCASTER_OAUTH,
                  ModalStep.TELEGRAM_OAUTH,
                  ModalStep.AWAITING_OAUTH,
                  ModalStep.SWITCH_WALLETS,
                ]),
              onPoll: () => {
                goBackIfPopupClosedOnSteps([
                  ModalStep.AWAITING_BIOMETRIC_LOGIN,
                  ModalStep.AWAITING_PASSWORD_LOGIN,
                  ModalStep.EMBEDDED_PASSWORD_LOGIN,
                  ModalStep.OTP,
                  ModalStep.SWITCH_WALLETS,
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
    }
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

      if (typeof window !== 'undefined') {
        refs.popupWindow.current = openPopup({
          url: isPIN ? authState.pinUrl! : isPassword ? authState.passwordUrl! : authState.passkeyUrl!,
          target: isPIN ? 'ParaPIN' : isPassword ? 'ParaPassword' : 'ParaPasskey',
          type: isPIN ? 'LOGIN_PASSWORD' : isPassword ? 'LOGIN_PASSWORD' : 'LOGIN_PASSKEY',
          current: refs.popupWindow.current,
        });
      }

      setStep(isPassword || isPIN ? ModalStep.AWAITING_PASSWORD_LOGIN : ModalStep.AWAITING_BIOMETRIC_LOGIN);
    },
    [loginState, biometricHints],
  );

  const onNewAuthState = async (authState: AuthState) => {
    setAuthState(authState);

    switch (authState.stage) {
      case 'verify':
        if (isExternalWallet(authState.auth)) {
          if (authState.loginUrl && authState.externalWallet?.withFullParaAuth) {
            let isBasicLogin = false;

            if (authState.nextStage === 'login') {
              isBasicLogin = authState.loginAuthMethods.includes(AuthMethod.BASIC_LOGIN);
            } else {
              isBasicLogin = authState.signupAuthMethods.includes(AuthMethod.BASIC_LOGIN);
            }

            if (authState.nextStage === 'login') {
              setFlow('login');
              isBasicLogin && pollLogin();
            } else {
              setFlow('signup');
              isBasicLogin && pollSignup();
            }

            if (!isMobile() && refs.popupWindow.current) {
              (refs.popupWindow.current as Window).location.href = authState.loginUrl;
              setStep(ModalStep.AWAITING_ACCOUNT);
            } else {
              setIFrameUrl(authState.loginUrl);
              setStep(ModalStep.OTP);
              setupListener();
            }
          } else {
            setStep(ModalStep.EXTERNAL_WALLET_VERIFICATION);
          }
        } else {
          if (authState.nextStage === 'login') {
            setFlow('login');
            pollLogin();
          } else {
            setFlow('signup');
            pollSignup();
          }

          // if loginUrl is present it is SLO so use the OTP flow
          if (authState.loginUrl) {
            setIFrameUrl(authState.loginUrl);
            setIsIFrameReady(false);
            presentVerifyUi(AuthMethod.BASIC_LOGIN, authState);
          } else {
            setStep(ModalStep.VERIFICATIONS);
          }
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

          pollSignup();

          if (isPasswordOrPINOnly) {
            presentSignupUi(isPassword ? AuthMethod.PASSWORD : AuthMethod.PIN, authState);
          } else {
            setStep(ModalStep.BIOMETRIC_CREATION);
          }
        }
        break;
      case 'done':
        // This is done in the verify step for withFullParaAuth external wallets & should not be done for verify-only external wallets
        if (!authState.externalWallet?.withFullParaAuth && !authState.externalWallet?.withVerification) {
          if (authState.isNewUser) {
            pollSignup();
            setFlow('signup');
          } else {
            pollLogin();
            setFlow('login');
          }
        }

        if (!authState.isWalletSelectionNeeded) {
          setStep(ModalStep.AWAITING_ACCOUNT);
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

  const verifyFarcaster = async (serverAuthState?: VerifyThirdPartyAuth) => {
    if (!serverAuthState) {
      setStep(ModalStep.FARCASTER_OAUTH);
    } else {
      setupListener();
    }

    mutateVerifyFarcaster(
      {
        isCanceled: () => refs.currentStep.current !== ModalStep.FARCASTER_OAUTH,
        onConnectUri: connectUri => {
          setFarcasterConnectUri(connectUri);
          openMobileUrl(connectUri);
        },
        useShortUrls: true,
        serverAuthState,
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

  const verifyTelegram = async (serverAuthState: VerifyThirdPartyAuth) => {
    if (serverAuthState) {
      setupListener();
    }

    mutateVerifyTelegram(
      {
        serverAuthState,
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

  const switchWallets = () => {
    if (!switchWalletsUrl) {
      return;
    }

    setIsSwitchWalletsPending(true);

    try {
      // Get the switch wallets URL (authMethod is automatically included via constructPortalUrl)

      setStep(ModalStep.SWITCH_WALLETS);

      // Open popup for non-BASIC_LOGIN wallet switching
      refs.popupWindow.current = openPopup({
        url: switchWalletsUrl,
        target: 'ParaSwitchWallets',
        type: 'SWITCH_WALLETS',
        current: refs.popupWindow.current,
      });

      // Start polling using the same pattern as waitForLogin
      pollSwitchWallets();
    } catch (error) {
      console.error('Failed to open wallet switching popup:', error);
    }
  };

  const pollSwitchWallets = () => {
    if (typeof window !== 'undefined') {
      refs.poll.current = {
        action: 'login',
        timeout: window?.setTimeout(async () => {
          mutateSwitchWallets(
            {
              isCanceled: () => {
                const exitedSteps = cancelIfExitedSteps([ModalStep.SWITCH_WALLETS, ModalStep.SWITCH_WALLETS_IFRAME]);
                const popupClosed = refs.popupWindow.current?.closed ?? false;
                const isCanceled = exitedSteps || popupClosed;

                // If user manually went back or popup is closed, clear wallet switching state
                if (isCanceled) {
                  // If popup is closed, go back immediately (only if still on switch wallets step)
                  if (
                    popupClosed &&
                    (refs.currentStep.current === ModalStep.SWITCH_WALLETS ||
                      refs.currentStep.current === ModalStep.SWITCH_WALLETS_IFRAME)
                  ) {
                    goBack();
                  }
                }

                return isCanceled;
              },
              onPoll: () => {
                // Only call goBack if still on switch wallets step (prevents duplicate calls)
                if (
                  refs.currentStep.current === ModalStep.SWITCH_WALLETS ||
                  refs.currentStep.current === ModalStep.SWITCH_WALLETS_IFRAME
                ) {
                  goBackIfPopupClosedOnSteps([ModalStep.SWITCH_WALLETS, ModalStep.SWITCH_WALLETS_IFRAME]);
                }
              },
            },
            {
              onSuccess: () => {
                updateSelectedWallet();

                // Change step after a small delay to allow polling to complete
                setTimeout(() => {
                  setStep(ModalStep.ACCOUNT_PROFILE);
                  refs.popupWindow.current = null;
                }, 500);
              },
              onError: () => {
                // Only call goBack if still on switch wallets step (prevents duplicate calls)
                if (refs.currentStep.current === ModalStep.SWITCH_WALLETS) {
                  goBack();
                }
              },
              onSettled: () => {
                setIsSwitchWalletsPending(false);
                window?.clearTimeout(refs.poll.current?.timeout);
                refs.poll.current = null;
                refs.popupWindow.current = null;
                // Don't reset wallet switch status here - let it be reset only on successful completion
              },
            },
          );
        }, DEFAULTS.LOGGIN_POLLING_DELAY_MS),
      };
    }
  };

  const isPasswordIFrameLoading = !!iFrameUrl && iFrameUrl === signupState?.passwordUrl && !isIFrameReady;

  const value = useMemo<Value>(
    () => ({
      presentSignupUi,
      presentLoginUi,
      presentVerifyUi,
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
      switchWallets,
      switchWalletsUrl,
      setSwitchWalletsUrl,
      isSwitchWalletsPending,
      biometricHints: biometricHints || undefined,
      verifyFarcasterStatus,
    }),
    [
      presentSignupUi,
      presentLoginUi,
      presentVerifyUi,
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
      switchWallets,
      switchWalletsUrl,
      setSwitchWalletsUrl,
      isSwitchWalletsPending,
      biometricHints,
      verifyFarcasterStatus,
    ],
  );

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (!!authStepRoute && refs.currentStep.current !== authStepRoute) {
      // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
      timerId = setTimeout(() => {
        setStep(authStepRoute);
      }, 200);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
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
    setIsSwitchWalletsPending(prev => (!!prev ? mutateIsSwitchWalletsPending : prev));
  }, [mutateIsSwitchWalletsPending]);

  useEffect(() => {
    return () => {
      window?.clearTimeout(refs.poll.current?.timeout); // Clean up message listener on unmount
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthActions = () => useContext(AuthContext);
