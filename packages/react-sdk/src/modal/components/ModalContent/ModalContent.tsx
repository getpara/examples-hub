import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Wallet } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Header } from '../Header/Header.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { CapsuleModalProps } from '../../types/modalProps.js';
import { DEFAULTS } from '../../constants/defaults.js';
import { CpslAnimation } from '@usecapsule/react-components';
import { useGoBack } from '../../hooks/useGoBack.js';

type ModalContentProps = Omit<
  CapsuleModalProps,
  'capsule' | 'isOpen' | 'theme' | 'branding' | 'onModalStepChange' | 'onExpandModalChange'
> & {
  hasFinishedAnimation: boolean;
  setModalExpanded: (v: boolean) => void;
};

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
      oAuthMethods,
      currentStepOverride,
      hasFinishedAnimation,
      disableEmailLogin,
      disablePhoneLogin,
      networks = ['ETHEREUM'],
      onClose,
      onRampConfig,
      loginTransitionOverride,
      createWalletOverride,
      setModalExpanded,
    },
    ref,
  ) => {
    const capsule = useCapsuleStore(state => state.capsule);
    const currentStep = useModalStore(state => state.step);
    const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
    const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
    const isLogin = useModalStore(state => state.isLogin());
    const loginWindow = useModalStore(state => state.loginWindow);
    const setStep = useModalStore(state => state.setStep);
    const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
    const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
    const resetModalState = useModalStore(state => state.resetState);
    const setLoginWindow = useModalStore(state => state.setLoginWindow);
    const resetUserInfoState = useUserInfoStore(state => state.resetState);
    const goBack = useGoBack();

    const loginTimeout = useRef<number>();
    const createAccountTimeout = useRef<number>();

    const [walletCreationInProgress, setWalletCreationInProgress] = useState(false);
    const [recoveryShare, setRecoveryShare] = useState<string>(null);

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
      const { isComplete, isError, needsWallet } = await capsule.waitForLoginAndSetup(loginWindow);

      setLoginWindow(undefined);

      if (isError) {
        goBack();
        return;
      }

      if (isComplete) {
        setWebAuthURLForLogin('');

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
        setStep(ModalStep.AWAITING_WALLET_CREATION);
      }
    }

    useEffect(() => {
      if (currentStepOverride) {
        setStep(currentStepOverride as ModalStep);
      }
    }, [currentStepOverride]);

    // generate/claim wallet once we know it's account creation
    useEffect(() => {
      if (currentStep !== ModalStep.AWAITING_WALLET_CREATION || walletCreationInProgress) {
        return;
      }
      async function genWallet() {
        setWalletCreationInProgress(true);
        let recoverySecret: string, walletIds: string[];
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
              id: wallet.id,
              address: wallet.address,
              scheme: wallet.scheme,
              signer: '',
            };
          }
          capsule.setWallets(newWallets);
          recoverySecret = created.recoverySecret;
          walletIds = created.walletIds;
        }

        await capsule.setCurrentWalletIds(walletIds);

        setRecoveryShare(recoverySecret);
        setWalletCreationInProgress(false);
        if (!recoverySecret) {
          setStep(ModalStep.WALLET_CREATION_DONE);
        } else {
          setStep(ModalStep.SECRET);
        }
      }
      genWallet();
    }, [isLogin, currentStep]);

    // wait for biometric to be added to move on to next step
    useEffect(() => {
      if (webAuthURLForCreate) {
        createAccountTimeout.current = window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS);
      }
      return () => clearTimeout(createAccountTimeout.current);
    }, [webAuthURLForCreate]);

    // wait for login auth to do post login setup
    useEffect(() => {
      if (webAuthURLForLogin && loginWindow) {
        if (loginTransitionOverride) {
          async function loginOverride() {
            await loginTransitionOverride(capsule);

            setWebAuthURLForLogin('');

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
      return () => window.clearTimeout(loginTimeout.current);
    }, [webAuthURLForLogin, loginWindow]);

    const handleClose = () => {
      if (
        currentStep === ModalStep.LOGIN_DONE ||
        currentStep === ModalStep.TWO_FACTOR_DONE ||
        currentStep === ModalStep.SETUP_2FA ||
        currentStep === ModalStep.SECRET ||
        currentStep === ModalStep.BIOMETRIC_LOGIN ||
        currentStep === ModalStep.BIOMETRIC_CREATION ||
        currentStep === ModalStep.WALLET_CREATION_DONE
      ) {
        // Using a timeout here so state is reset once modal animates out.
        setTimeout(() => {
          resetModalState();
          resetUserInfoState();
          setRecoveryShare(null);
        }, 200);
      } else if (
        currentStep === ModalStep.ADD_FUNDS ||
        currentStep === ModalStep.ADD_FUNDS_AWAITING ||
        currentStep === ModalStep.ADD_FUNDS_SUCCESS ||
        currentStep === ModalStep.ADD_FUNDS_FAILURE
      ) {
        setTimeout(() => {
          setStep(ModalStep.LOGIN_DONE);
        }, 200);
      } else {
        setStep(ModalStep.SIGN_UP);
      }
      capsule.exitLoops();
      onClose();
    };

    useEffect(() => {
      if (![ModalStep.BIOMETRIC_CREATION, ModalStep.AWAITING_BIOMETRIC_CREATION].includes(currentStep)) {
        capsule.exitAccountCreation();
      }

      if (![ModalStep.BIOMETRIC_LOGIN, ModalStep.AWAITING_BIOMETRIC_LOGIN].includes(currentStep)) {
        capsule.exitLogin();
      }
    }, [currentStep]);

    useEffect(() => {
      return () => {
        capsule.exitLoops();
      };
    }, []);

    const handleExpandModal = () => {
      setModalExpanded(true);
    };

    const handleCondenseModal = () => {
      setModalExpanded(false);
    };

    return (
      <>
        {[ModalStep.WALLET_CREATION_DONE, ModalStep.ADD_FUNDS_SUCCESS].includes(currentStep) && (
          <CpslAnimation src="https://product-assets.sandbox.usecapsule.com/animations/confetti.json" />
        )}
        <Header onClose={handleClose} condenseModal={handleCondenseModal} />
        <Body
          hasFinishedAnimation={hasFinishedAnimation}
          oAuthMethods={oAuthMethods}
          twoFactorAuthEnabled={twoFactorAuthEnabled}
          recoveryShare={recoveryShare}
          disableEmailLogin={disableEmailLogin}
          disablePhoneLogin={disablePhoneLogin}
          networks={networks}
          onClose={handleClose}
          onRampConfig={onRampConfig}
        />
        <Footer expandModal={handleExpandModal} />
      </>
    );
  },
);
