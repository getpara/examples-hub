import { CpslModal } from '@usecapsule/react-components';

import { useEffect, useRef, useState } from 'react';
import { Wallet } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores';
import { ModalStep } from '../../utils/steps';
import { Header } from '../Header/Header';
import { Body } from '../Body/Body';
import { Footer } from '../Footer/Footer';
import { CapsuleModalV2Props } from '../../types/modalProps';
import { DEFAULTS } from '../../constants/defaults';

export const Modal = ({
  twoFactorAuthEnabled = true,
  oAuthMethods,
  currentStepOverride,
  hasFinishedAnimation,
  onClose,
  loginTransitionOverride,
  createWalletOverride,
}: Omit<CapsuleModalV2Props, 'capsule' | 'isOpen' | 'theme' | 'branding'> & {
  hasFinishedAnimation: boolean;
}) => {
  const capsule = useCapsuleStore((state) => state.capsule);
  const currentStep = useModalStore((state) => state.step);
  const webAuthURLForLogin = useModalStore((state) => state.webAuthURLForLogin);
  const webAuthURLForCreate = useModalStore(
    (state) => state.webAuthURLForCreate,
  );
  const isFullyLoggedIn = useModalStore((state) => state.isFullyLoggedIn);
  const isLogin = useModalStore((state) => state.isLogin());
  const setStep = useModalStore((state) => state.setStep);
  const setWebAuthURLForLogin = useModalStore(
    (state) => state.setWebAuthURLForLogin,
  );
  const setWebAuthURLForCreate = useModalStore(
    (state) => state.setWebAuthURLForCreate,
  );
  const setIsFullyLoggedIn = useModalStore((state) => state.setIsFullyLoggedIn);
  const resetModalState = useModalStore((state) => state.resetState);
  const resetUserInfoState = useUserInfoStore((state) => state.resetState);

  const loginTimeout = useRef<number>();
  const createAccountTimeout = useRef<number>();

  const [walletCreated, setWalletCreated] = useState(false);
  const [walletCreationInProgress, setWalletCreationInProgress] =
    useState(false);
  const [createWalletRes, setCreateWalletRes] =
    useState<[Wallet, string]>(null);
  const [recoveryShare, setRecoveryShare] = useState<string>(null);
  const [distributeDone, setDistributeDone] = useState(false);

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
    const { needsWallet } = await capsule.waitForLoginAndSetup();

    setIsFullyLoggedIn(true);
    setWebAuthURLForLogin('');

    if (needsWallet) {
      setStep(ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN);
    } else {
      if (await is2FASetup()) {
        setStep(ModalStep.LOGIN_DONE);
      } else {
        setStep(ModalStep.SETUP_2FA);
      }
    }
  }

  async function awaitWalletCreationTransition(): Promise<void> {
    await capsule.waitForAccountCreation();

    setIsFullyLoggedIn(true);
    setWebAuthURLForCreate('');
    setStep(ModalStep.AWAITING_WALLET_CREATION);
  }

  useEffect(() => {
    if (currentStepOverride) {
      setStep(currentStepOverride as ModalStep);
    }
  }, [currentStepOverride]);

  // generate wallet once we know it's account creation
  useEffect(() => {
    if (
      (isLogin &&
        currentStep !== ModalStep.AWAITING_WALLET_CREATION_AFTER_LOGIN) ||
      (!isLogin && currentStep !== ModalStep.AWAITING_WALLET_CREATION) ||
      walletCreated ||
      walletCreationInProgress ||
      (createWalletOverride &&
        ModalStep.AWAITING_WALLET_CREATION !== currentStep)
    ) {
      return;
    }
    async function genWallet() {
      setWalletCreationInProgress(true);
      if (!createWalletOverride) {
        const newWalletRes = await capsule.createWallet(true);
        setCreateWalletRes(newWalletRes);
      } else {
        const recoveryFromOverride = await createWalletOverride(capsule);
        const fetchedWallets = (await capsule.fetchWallets()).filter(
          (wallet) => !!wallet.address,
        );
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
        setRecoveryShare(recoveryFromOverride);
      }
      setWalletCreated(true);
      setWalletCreationInProgress(false);
    }
    genWallet();
  }, [isLogin, currentStep]);

  // distribute share once we know keygen is done
  useEffect(() => {
    if (distributeDone || !isFullyLoggedIn || !walletCreated) {
      return;
    }

    async function distributeShare() {
      if (!createWalletOverride) {
        const result = await capsule.distributeNewWalletShare(
          createWalletRes[0].id,
          createWalletRes[0].signer,
        );
        setRecoveryShare(result);
      }
      setDistributeDone(true);

      setStep(ModalStep.SECRET);
    }
    distributeShare();
  }, [isFullyLoggedIn, walletCreated, createWalletRes]);

  // wait for biometric to be added to move on to next step
  useEffect(() => {
    if (webAuthURLForCreate) {
      createAccountTimeout.current = window.setTimeout(
        awaitWalletCreationTransition,
        DEFAULTS.POLLING_INTERVAL_MS,
      );
    }
    return () => clearTimeout(createAccountTimeout.current);
  }, [webAuthURLForCreate]);

  // wait for login auth to do post login setup
  useEffect(() => {
    if (webAuthURLForLogin) {
      if (loginTransitionOverride) {
        // eslint-disable-next-line
        async function loginOverride() {
          await loginTransitionOverride(capsule);

          setIsFullyLoggedIn(true);
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
      loginTimeout.current = window.setTimeout(
        awaitLoginTransition,
        DEFAULTS.POLLING_INTERVAL_MS,
      );
    }
    return () => clearTimeout(loginTimeout.current);
  }, [webAuthURLForLogin]);

  const handleClose = () => {
    if (
      currentStep === ModalStep.LOGIN_DONE ||
      currentStep === ModalStep.TWO_FACTOR_DONE ||
      currentStep === ModalStep.SECRET
    ) {
      // Using a timeout here so state is reset once modal animates out.
      setTimeout(() => {
        resetModalState();
        resetUserInfoState();
        setDistributeDone(false);
        setWalletCreated(false);
        setCreateWalletRes(null);
        setRecoveryShare(null);
      }, 200);
    }
    onClose();
  };

  return (
    <CpslModal>
      <Header onClose={handleClose} />
      <Body
        hasFinishedAnimation={hasFinishedAnimation}
        oAuthMethods={oAuthMethods}
        twoFactorAuthEnabled={twoFactorAuthEnabled}
        recoveryShare={recoveryShare}
        onClose={handleClose}
      />
      <Footer />
    </CpslModal>
  );
};
