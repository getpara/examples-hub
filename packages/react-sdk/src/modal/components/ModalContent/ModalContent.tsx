import { createContext, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  Wallet,
  CurrentWalletIds,
  entityToWallet,
  EnabledFlow,
  AuthMethod,
  OnRampConfig,
  isPasskeySupported,
} from '@getpara/web-sdk';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { ParaModalProps } from '../../types/modalProps.js';
import { DEFAULTS } from '../../constants/defaults.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useWaitForLoginAndSetup, useWaitForPasskeyAndCreateWallet } from '../../../provider/index.js';
import { useCreateAccount } from '../../hooks/useCreateAccount.js';
import { formatBiometricHints } from '@getpara/react-common';

type ModalContentProps = Omit<
  ParaModalProps,
  'para' | 'isOpen' | 'theme' | 'branding' | 'onModalStepChange' | 'onExpandModalChange'
>;

export const ActionsContext = createContext<{ createAccount: ReturnType<typeof useCreateAccount> }>({
  createAccount: { withPasskey: () => {}, withPassword: () => {} },
});

export type ModalContentHandle = {
  /**
   * Trigger the modal close handler
   */
  handleModalClose: () => void;
};

export const ModalContent = forwardRef<ModalContentHandle, ModalContentProps>(
  (
    {
      twoFactorAuthEnabled = false,
      recoverySecretStepEnabled = false,
      oAuthMethods,
      disableEmailLogin,
      disablePhoneLogin,
      onClose,
      onRampTestMode,
      loginTransitionOverride,
      createWalletOverride,
    },
    ref,
  ) => {
    const para = useInternalClient();
    const refs = useModalStore(state => state.refs);
    const currentStep = useModalStore(state => state.step);
    const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
    const passwordUrlForLogin = useModalStore(state => state.passwordUrlForLogin);
    const isLogin = useModalStore(state => state.isLogin());
    const onRampConfig = useModalStore(state => state.onRampConfig);
    const setStep = useModalStore(state => state.setStep);
    const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
    const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
    const setPasswordUrlForLogin = useModalStore(state => state.setPasswordUrlForLogin);
    const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
    const setOnRampConfig = useModalStore(state => state.setOnRampConfig);
    const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
    const setAccountAddFundTab = useModalStore(state => state.setAccountAddFundTab);
    const setRecoveryShare = useUserInfoStore(state => state.setRecoveryShare);
    const authStepRoute = useModalStore(state => state.authStepRoute);
    const isIFrameReady = useModalStore(state => state.isIFrameReady);
    const goBack = useGoBack();
    const { connectEmbeddedToExternalConnectors } = useExternalWallets();
    const { waitForLoginAndSetup } = useWaitForLoginAndSetup();
    const { waitForPasskeyAndCreateWalletAsync } = useWaitForPasskeyAndCreateWallet();
    const createAccount = useCreateAccount();
    const biometricLocationHints = useModalStore(state => state.biometricLocationHints ?? []);
    const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints), [biometricLocationHints]);
    const passkeysSupported = isPasskeySupported();
    const [hasHints, isOnKnownDevice] = [biometricLocationHints?.length > 0, formattedHints?.isOnKnownDevice ?? false];

    const [walletCreationInProgress, setWalletCreationInProgress] = useState(false);

    useEffect(() => {
      if (!!authStepRoute && isIFrameReady) {
        // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
        setTimeout(() => {
          setStep(authStepRoute);
        }, 200);
      }
    }, [authStepRoute, isIFrameReady]);

    useImperativeHandle(ref, () => {
      return {
        handleModalClose() {
          handleClose();
        },
      };
    }, []);

    const is2FASetup = async () => {
      if (!twoFactorAuthEnabled) {
        return true;
      }
      try {
        const { isSetup } = await para.check2FAStatus();
        return isSetup;
      } catch (error) {
        console.error('An error occurred while checking 2FA:', error);
        return false;
      }
    };

    async function awaitLoginTransition() {
      waitForLoginAndSetup(
        { popupWindow: refs.popupWindow.current },
        {
          onSuccess: async ({ isComplete, isError, needsWallet }) => {
            if (isError) {
              return;
            }

            if (isComplete) {
              setWebAuthURLForLogin('');
              setPasswordUrlForLogin('');
              setSupportedAuthMethods(new Set<AuthMethod>());
              setBiometricLocationHints();

              if (needsWallet) {
                setStep(ModalStep.AWAITING_WALLET_CREATION);
              } else {
                await connectEmbeddedToExternalConnectors();
                if (await is2FASetup()) {
                  setStep(ModalStep.LOGIN_DONE);
                } else {
                  setStep(ModalStep.SETUP_2FA);
                }
              }
            }
          },
          onSettled: () => {
            window.clearTimeout(refs.poll.current?.timeout);
            refs.poll.current = null;
            refs.popupWindow.current = null;

            if (
              refs.currentStep.current === ModalStep.AWAITING_BIOMETRIC_LOGIN ||
              refs.currentStep.current === ModalStep.AWAITING_PASSWORD_LOGIN
            ) {
              goBack();
            }
          },
        },
      );
    }

    // generate/claim wallet once we know it's account creation
    useEffect(() => {
      if (currentStep !== ModalStep.AWAITING_WALLET_CREATION || walletCreationInProgress) {
        return;
      }
      async function genWallet() {
        setWalletCreationInProgress(true);
        let recoverySecret: string | undefined, walletIds: CurrentWalletIds | undefined;
        if (!createWalletOverride) {
          try {
            const created = await waitForPasskeyAndCreateWalletAsync();
            recoverySecret = created.recoverySecret;
            walletIds = created.walletIds;
          } catch (e) {}
        } else {
          const created = await createWalletOverride(para);
          const fetchedWallets = (await para.fetchWallets()).filter(wallet => !!wallet.address);
          const newWallets: Record<string, Wallet> = {};
          for (const wallet of fetchedWallets) {
            newWallets[wallet.id] = {
              ...entityToWallet(wallet),
              signer: '',
            };
          }
          para.setWallets(newWallets);
          recoverySecret = created.recoverySecret;
          walletIds = created.walletIds;
        }
        if (walletIds) {
          await para.setCurrentWalletIds(walletIds);
        }

        if (recoverySecret && recoverySecretStepEnabled) {
          setRecoveryShare(recoverySecret);
        }
        setWalletCreationInProgress(false);
        if (!recoverySecret || !recoverySecretStepEnabled) {
          setStep(ModalStep.WALLET_CREATION_DONE);
        } else {
          setStep(ModalStep.SECRET);
        }
      }
      genWallet();
    }, [isLogin, currentStep]);

    useEffect(() => {
      const isAwaitingLogin = [ModalStep.AWAITING_BIOMETRIC_LOGIN, ModalStep.AWAITING_PASSWORD_LOGIN].includes(currentStep);

      const isUnknownDeviceWithHints = hasHints && !isOnKnownDevice;

      const isPasskeyUnsupported = !passkeysSupported;

      const hasLoginURLs = webAuthURLForLogin || passwordUrlForLogin;

      const userNeedsToLogin = isAwaitingLogin || isUnknownDeviceWithHints || isPasskeyUnsupported;

      if (userNeedsToLogin && hasLoginURLs) {
        if (loginTransitionOverride) {
          async function loginOverride() {
            await loginTransitionOverride?.(para);

            setWebAuthURLForLogin('');
            setPasswordUrlForLogin('');
            setBiometricLocationHints();

            await connectEmbeddedToExternalConnectors();

            if (await is2FASetup()) {
              setStep(ModalStep.LOGIN_DONE);
            } else {
              setStep(ModalStep.SETUP_2FA);
            }
          }
          loginOverride();
          return;
        }

        if (typeof window !== 'undefined') {
          refs.poll.current = {
            action: 'login',
            timeout: window.setTimeout(awaitLoginTransition, DEFAULTS.LOGGIN_POLLING_DELAY_MS),
          };
        }

        return () => {
          if (typeof window !== 'undefined' && !!refs.poll.current) {
            window.clearTimeout(refs.poll.current?.timeout);
          }
          para.exitLogin();
        };
      }
    }, [currentStep, webAuthURLForLogin, passwordUrlForLogin]);

    const handleClose = () => {
      onClose?.();
    };

    useEffect(() => {
      refs.currentStep.current = currentStep;

      let resetPoll = false;
      if (![ModalStep.AWAITING_BIOMETRIC_CREATION, ModalStep.PASSWORD_CREATION].includes(currentStep)) {
        para.exitAccountCreation();
        resetPoll = !!refs.poll.current && ['createPassword', 'createPasskey'].includes(refs.poll.current.action);
      }

      if (![ModalStep.AWAITING_PASSWORD_LOGIN, ModalStep.AWAITING_BIOMETRIC_LOGIN].includes(currentStep)) {
        para.exitLogin();
        resetPoll = refs.poll.current?.action === 'login';
      }

      if (![ModalStep.AWAITING_OAUTH, ModalStep.FARCASTER_OAUTH].includes(currentStep)) {
        para.exitOAuth();
      }

      if (currentStep === ModalStep.PASSWORD_CREATION) {
        createAccount.withPassword();
      }

      if (resetPoll && typeof window !== 'undefined') {
        window.clearTimeout(refs.poll.current?.timeout);
        refs.poll.current = null;
      }
    }, [currentStep]);

    useEffect(() => {
      if (!onRampConfig) {
        para.ctx.client
          .getOnRampConfig()
          .then(res => {
            let newOnRampConfig: OnRampConfig & { testMode?: boolean };

            newOnRampConfig = { ...res, testMode: onRampTestMode };

            setOnRampConfig(newOnRampConfig);

            if (!accountAddFundTab) {
              setAccountAddFundTab(
                newOnRampConfig.isBuyEnabled
                  ? EnabledFlow.BUY
                  : newOnRampConfig.isReceiveEnabled
                    ? EnabledFlow.RECEIVE
                    : newOnRampConfig.isWithdrawEnabled
                      ? EnabledFlow.WITHDRAW
                      : undefined,
              );
            }
          })
          .catch();
      }
    }, []);

    useEffect(() => {
      if (!!onRampConfig) {
        setOnRampConfig({ ...onRampConfig, testMode: onRampTestMode });
      }
    }, [onRampTestMode]);

    useEffect(() => {
      return () => {
        window.clearTimeout(refs.poll.current?.timeout);
        para.exitLoops();
      };
    }, []);

    return (
      <ActionsContext.Provider value={{ createAccount }}>
        <Body
          oAuthMethods={oAuthMethods}
          twoFactorAuthEnabled={twoFactorAuthEnabled}
          disableEmailLogin={!!disableEmailLogin}
          disablePhoneLogin={!!disablePhoneLogin}
          onClose={handleClose}
        />
        <Footer />
      </ActionsContext.Provider>
    );
  },
);
