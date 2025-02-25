import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Wallet, CurrentWalletIds, entityToWallet, EnabledFlow, AuthMethod, OnRampConfig } from '@getpara/web-sdk';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { ParaModalProps } from '../../types/modalProps.js';
import { DEFAULTS } from '../../constants/defaults.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { openPopup } from '../../utils/openPopup.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import {
  useWaitForAccountCreation,
  useWaitForLoginAndSetup,
  useWaitForPasskeyAndCreateWallet,
} from '../../../provider/index.js';

type ModalContentProps = Omit<
  ParaModalProps,
  'para' | 'isOpen' | 'theme' | 'branding' | 'onModalStepChange' | 'onExpandModalChange'
>;

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
    const currentStep = useModalStore(state => state.step);
    const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
    const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
    const passwordUrlForLogin = useModalStore(state => state.passwordUrlForLogin);
    const isLogin = useModalStore(state => state.isLogin());
    const popupWindow = useModalStore(state => state.popupWindow);
    const onRampConfig = useModalStore(state => state.onRampConfig);
    const setStep = useModalStore(state => state.setStep);
    const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
    const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
    const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
    const setPopupWindow = useModalStore(state => state.setPopupWindow);
    const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
    const setPasswordUrlForLogin = useModalStore(state => state.setPasswordUrlForLogin);
    const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
    const setOnRampConfig = useModalStore(state => state.setOnRampConfig);
    const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
    const setAccountAddFundTab = useModalStore(state => state.setAccountAddFundTab);
    const setRecoveryShare = useUserInfoStore(state => state.setRecoveryShare);
    const goBack = useGoBack();
    const { connectEmbeddedToExternalConnectors } = useExternalWallets();
    const { waitForLoginAndSetup } = useWaitForLoginAndSetup();
    const { waitForAccountCreation } = useWaitForAccountCreation();
    const { waitForPasskeyAndCreateWalletAsync } = useWaitForPasskeyAndCreateWallet();

    const loginTimeout = useRef<number>();
    const createAccountTimeout = useRef<number>();

    const [walletCreationInProgress, setWalletCreationInProgress] = useState(false);

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
        { popupWindow },
        {
          onSuccess: async ({ isComplete, isError, needsWallet }) => {
            if (isError) {
              goBack();
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
          onError: () => {
            goBack();
          },
          onSettled: () => {
            setPopupWindow(undefined);
          },
        },
      );
    }

    async function awaitWalletCreationTransition() {
      waitForAccountCreation(undefined, {
        onSuccess: isComplete => {
          if (isComplete) {
            setWebAuthURLForCreate('');
            setIFrameUrl('');
            setStep(ModalStep.AWAITING_WALLET_CREATION);
          }
        },
      });
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

    async function createAccountWithPassword() {
      if (typeof window !== 'undefined') {
        clearTimeout(createAccountTimeout.current);
        createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
      }
      setStep(ModalStep.PASSWORD_CREATION);
    }

    async function createAccountWithPasskey() {
      if (typeof window !== 'undefined') {
        clearTimeout(createAccountTimeout.current);
        createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
        webAuthURLForCreate && openPopup(webAuthURLForCreate, 'ParaPasskey', 'CREATE_PASSKEY');
        setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
      }
    }

    // wait for login auth to do post login setup
    useEffect(() => {
      if (webAuthURLForLogin || passwordUrlForLogin) {
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
          loginTimeout.current = window.setTimeout(awaitLoginTransition, DEFAULTS.LOGGIN_POLLING_DELAY_MS);
        }
      }
      return () => {
        typeof window !== 'undefined' && window.clearTimeout(loginTimeout.current);
        para.exitLogin();
      };
    }, [webAuthURLForLogin, passwordUrlForLogin, popupWindow]);

    const handleClose = () => {
      onClose?.();
    };

    useEffect(() => {
      if (![ModalStep.BIOMETRIC_CREATION, ModalStep.AWAITING_BIOMETRIC_CREATION].includes(currentStep)) {
        para.exitAccountCreation();
      }

      if (![ModalStep.BIOMETRIC_LOGIN, ModalStep.AWAITING_BIOMETRIC_LOGIN].includes(currentStep)) {
        para.exitLogin();
      }

      if (![ModalStep.AWAITING_OAUTH, ModalStep.FARCASTER_OAUTH].includes(currentStep)) {
        para.exitOAuth();
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
        para.exitLoops();
      };
    }, []);

    return (
      <>
        <Body
          oAuthMethods={oAuthMethods}
          twoFactorAuthEnabled={twoFactorAuthEnabled}
          disableEmailLogin={!!disableEmailLogin}
          disablePhoneLogin={!!disablePhoneLogin}
          onClose={handleClose}
          createAccountWithPasskey={createAccountWithPasskey}
          createAccountWithPassword={createAccountWithPassword}
        />
        <Footer />
      </>
    );
  },
);
