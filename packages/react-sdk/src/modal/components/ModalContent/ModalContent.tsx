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
} from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { CapsuleModalProps } from '../../types/modalProps.js';
import { DEFAULTS } from '../../constants/defaults.js';
import { useGoBack } from '../../hooks/useGoBack.js';

type ModalContentProps = Omit<
  CapsuleModalProps,
  'capsule' | 'isOpen' | 'theme' | 'branding' | 'onModalStepChange' | 'onExpandModalChange'
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
    const capsule = useCapsuleStore(state => state.capsule);
    const currentStep = useModalStore(state => state.step);
    const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
    const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
    const passwordUrlForCreate = useModalStore(state => state.passwordUrlForCreate);
    const passwordUrlForLogin = useModalStore(state => state.passwordUrlForLogin);
    const supportedAuthMethods = useModalStore(state => state.supportedAuthMethods);
    const isLogin = useModalStore(state => state.isLogin());
    const popupWindow = useModalStore(state => state.popupWindow);
    const onRampConfig = useModalStore(state => state.onRampConfig);
    const setStep = useModalStore(state => state.setStep);
    const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
    const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
    const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
    const setPopupWindow = useModalStore(state => state.setPopupWindow);
    const setPasswordUrlForCreate = useModalStore(state => state.setPasswordUrlForCreate);
    const setPasswordUrlForLogin = useModalStore(state => state.setPasswordUrlForLogin);
    const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
    const setOnRampConfig = useModalStore(state => state.setOnRampConfig);
    const setRecoveryShare = useUserInfoStore(state => state.setRecoveryShare);
    const goBack = useGoBack();

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
        const { isSetup } = await capsule.check2FAStatus();
        return isSetup;
      } catch (error) {
        console.error('An error occurred while checking 2FA:', error);
        return false;
      }
    };

    async function awaitLoginTransition(): Promise<void> {
      const { isComplete, isError, needsWallet } = await capsule.waitForLoginAndSetup(popupWindow);

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
          if (await is2FASetup()) {
            setStep(ModalStep.LOGIN_DONE);
          } else {
            setStep(ModalStep.SETUP_2FA);
          }
        }
      }
    }

    async function awaitWalletCreationTransition(): Promise<void> {
      const isComplete = await capsule.waitForAccountCreation();

      if (isComplete) {
        setWebAuthURLForCreate('');
        setPasswordUrlForCreate('');
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
          const created = await capsule.waitForPasskeyAndCreateWallet();
          recoverySecret = created.recoverySecret;
          walletIds = created.walletIds;
        } else {
          const created = await createWalletOverride(capsule);
          const fetchedWallets = (await capsule.fetchWallets()).filter(wallet => !!wallet.address);
          const newWallets: Record<string, Wallet> = {};
          for (const wallet of fetchedWallets) {
            newWallets[wallet.id] = {
              ...entityToWallet(wallet),
              signer: '',
            };
          }
          capsule.setWallets(newWallets);
          recoverySecret = created.recoverySecret;
          walletIds = created.walletIds;
        }
        await capsule.setCurrentWalletIds(walletIds);

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

    // wait for biometric to be added to move on to next step
    useEffect(() => {
      if (webAuthURLForCreate || passwordUrlForCreate) {
        createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
      }
      return () => clearTimeout(createAccountTimeout.current);
    }, [webAuthURLForCreate, passwordUrlForCreate]);

    // wait for login auth to do post login setup
    useEffect(() => {
      if (webAuthURLForLogin || passwordUrlForLogin || supportedAuthMethods) {
        if (loginTransitionOverride) {
          async function loginOverride() {
            await loginTransitionOverride(capsule);

            setWebAuthURLForLogin('');
            setPasswordUrlForLogin('');
            setBiometricLocationHints();

            if (await is2FASetup()) {
              setStep(ModalStep.LOGIN_DONE);
            } else {
              setStep(ModalStep.SETUP_2FA);
            }
          }
          loginOverride();
          return;
        }
        loginTimeout.current = window.setTimeout(awaitLoginTransition, DEFAULTS.POLLING_INTERVAL_MS);
      }
      return () => {
        window.clearTimeout(loginTimeout.current);
        capsule.exitLogin();
      };
    }, [webAuthURLForLogin, passwordUrlForLogin, popupWindow, supportedAuthMethods]);

    const handleClose = () => {
      onClose();
    };

    useEffect(() => {
      if (![ModalStep.BIOMETRIC_CREATION, ModalStep.AWAITING_BIOMETRIC_CREATION].includes(currentStep)) {
        capsule.exitAccountCreation();
      }

      if (![ModalStep.BIOMETRIC_LOGIN, ModalStep.AWAITING_BIOMETRIC_LOGIN].includes(currentStep)) {
        capsule.exitLogin();
      }

      if (![ModalStep.AWAITING_OAUTH, ModalStep.FARCASTER_OAUTH].includes(currentStep)) {
        capsule.exitOAuth();
      }
    }, [currentStep]);

    useEffect(() => {
      if (!onRampConfig) {
        capsule.ctx.capsuleClient
          .getOnRampConfig()
          .then(res => {
            if (!!propsOnRampConfig) {
              const { enabledFlows, network, asset, providers, testMode } = propsOnRampConfig;
              const rampConfig = providers.find(config => isRampConfig(config));

              setOnRampConfig({
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
              });

              return;
            }

            setOnRampConfig({ ...res, testMode: onRampTestMode });
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
        capsule.exitLoops();
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
        />
        <Footer />
      </>
    );
  },
);
