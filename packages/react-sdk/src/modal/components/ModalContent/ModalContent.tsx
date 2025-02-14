import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Wallet,
  CurrentWalletIds,
  entityToWallet,
  OnRampProvider,
  deprecated__StripeConfig,
  deprecated__RampConfig,
  OnRampAsset,
  Network,
  EnabledFlow,
  AuthMethod,
  OnRampConfig,
} from '@getpara/web-sdk';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { ParaModalProps } from '../../types/modalProps.js';
import { DEFAULTS } from '../../constants/defaults.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { openPopup } from '../../utils/openPopup.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useEmbeddedExternalConnection } from '../../hooks/useEmbeddedExternalConnection.js';

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

function isRampConfig(config: deprecated__StripeConfig | deprecated__RampConfig): config is deprecated__RampConfig {
  return 'hostApiKey' in config;
}

const AssetNetworks = {
  [OnRampAsset.SOLANA]: Network.SOLANA,
  [OnRampAsset.ATOM]: Network.COSMOS,
  [OnRampAsset.CELO]: Network.CELO,
  [OnRampAsset.POLYGON]: Network.POLYGON,
};

const AssetMap = {
  SOLANA: OnRampAsset.SOLANA,
  SOL: OnRampAsset.SOLANA,
  ATOM: OnRampAsset.ATOM,
  CELO: OnRampAsset.CELO,
  POLYGON: OnRampAsset.POLYGON,
  MATIC: OnRampAsset.POLYGON,
  USDC: OnRampAsset.USDC,
  ETH: OnRampAsset.ETHEREUM,
  ETHEREUM: OnRampAsset.ETHEREUM,
};

export const ModalContent = forwardRef<ModalContentHandle, ModalContentProps>(
  (
    {
      onRampConfig: propsOnRampConfig,
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

    const loginTimeout = useRef<number>();
    const createAccountTimeout = useRef<number>();

    const [walletCreationInProgress, setWalletCreationInProgress] = useState(false);

    const connectEmbeddedToExternalConnectors = useEmbeddedExternalConnection();

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

    async function awaitLoginTransition(): Promise<void> {
      // TODO: migrate to useWaitForLoginAndSetup hook once we force the use of the CapsuleProvider
      const { isComplete, isError, needsWallet } = await para.waitForLoginAndSetup({ popupWindow });

      setPopupWindow(undefined);

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
    }

    async function awaitWalletCreationTransition(): Promise<void> {
      // TODO: migrate to useWaitForAccountCreation hook once we force the use of the ParaProvider
      const isComplete = await para.waitForAccountCreation();

      if (isComplete) {
        setWebAuthURLForCreate('');
        setIFrameUrl('');
        setStep(ModalStep.AWAITING_WALLET_CREATION);
      }
    }

    // generate/claim wallet once we know it's account creation
    useEffect(() => {
      if (currentStep !== ModalStep.AWAITING_WALLET_CREATION || walletCreationInProgress) {
        return;
      }
      async function genWallet() {
        setWalletCreationInProgress(true);
        let recoverySecret: string, walletIds: CurrentWalletIds;
        if (!createWalletOverride) {
          // TODO: migrate to useWaitForPasskeyAndCreateWallet hook once we force the use of the ParaProvider
          const created = await para.waitForPasskeyAndCreateWallet();
          recoverySecret = created.recoverySecret;
          walletIds = created.walletIds;
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
        await para.setCurrentWalletIds(walletIds);

        if (recoverySecretStepEnabled) {
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
      setStep(ModalStep.PASSWORD_CREATION);
    }

    async function createAccountWithPasskey() {
      if (typeof window !== 'undefined') {
        clearTimeout(createAccountTimeout.current);
        createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
        openPopup(webAuthURLForCreate, 'ParaPasskey', 'CREATE_PASSKEY');
        setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
      }
    }

    // wait for login auth to do post login setup
    useEffect(() => {
      if (webAuthURLForLogin || passwordUrlForLogin) {
        if (loginTransitionOverride) {
          async function loginOverride() {
            await loginTransitionOverride(para);

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
      onClose();
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

      if (currentStep === ModalStep.PASSWORD_CREATION) {
        if (typeof window !== 'undefined') {
          clearTimeout(createAccountTimeout.current);
          createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
        }
      }
    }, [currentStep]);

    useEffect(() => {
      if (!onRampConfig) {
        para.ctx.client
          .getOnRampConfig()
          .then(res => {
            let newOnRampConfig: OnRampConfig & { testMode?: boolean };
            if (!!propsOnRampConfig) {
              const { enabledFlows, network, asset, providers, testMode } = propsOnRampConfig;
              const rampConfig = providers.find(config => isRampConfig(config));

              newOnRampConfig = {
                isBuyEnabled: !enabledFlows || enabledFlows.some(str => EnabledFlow[str] === EnabledFlow.BUY),
                isReceiveEnabled: !enabledFlows || enabledFlows.some(str => EnabledFlow[str] === EnabledFlow.RECEIVE),
                isWithdrawEnabled: !enabledFlows || enabledFlows.some(str => EnabledFlow[str] === EnabledFlow.WITHDRAW),
                allowedAssets: network
                  ? { [Network[network]]: asset ? [AssetMap[asset]] : true }
                  : asset
                    ? { [AssetNetworks[AssetMap[asset]] ?? Network.ETHEREUM]: [AssetMap[asset]] }
                    : res.allowedAssets,
                assetInfo: res.assetInfo,
                providers: providers.map(({ id }) => OnRampProvider[id]),
                rampApiKey: rampConfig?.hostApiKey ?? res.rampApiKey,
                testMode: testMode ?? onRampTestMode,
              };
            } else {
              newOnRampConfig = { ...res, testMode: onRampTestMode };
            }

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
          disableEmailLogin={disableEmailLogin}
          disablePhoneLogin={disablePhoneLogin}
          onClose={handleClose}
          createAccountWithPasskey={createAccountWithPasskey}
          createAccountWithPassword={createAccountWithPassword}
        />
        <Footer />
      </>
    );
  },
);
