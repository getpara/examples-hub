import { CpslAuthModal, defineCustomElements, generateTheme } from '@getpara/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModalStore, useUserInfoStore, useThemeStore } from './stores/index.js';
import { ModalStep, RESET_TO_ACCOUNT_STEPS, RESET_TO_AUTH_STEPS } from './utils/steps.js';
import { AuthLayout, ParaModalHandle, ParaModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import { ParaEvent } from '@getpara/web-sdk';
import { ExternalWalletsWrapper } from './components/ExternalWalletsWrapper/ExternalWalletsWrapper.js';
import { CountryCallingCode } from 'libphonenumber-js';
import styled from 'styled-components';
import { useExternalWallets } from './providers/ExternalWalletContext.js';
import { hasEmbeddedAuth, hasExternalWallet } from './utils/authLayoutHelpers.js';
import { useModal, useWalletState } from '../provider/index.js';
import { useStore } from '../provider/stores/useStore.js';
import { ParaInternal } from '@getpara/react-common';
import { useInternalClient } from '../provider/hooks/utils/useInternalClient.js';

defineCustomElements();

export const ParaModal = forwardRef<ParaModalHandle, ParaModalProps>(({ para, isOpen, ...rest }, ref) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const setClient = useStore(state => state.setClient);
  const client = useStore(state => state.client);
  const { closeModal, openModal } = useModal();

  useEffect(() => {
    if (!client) {
      setClient(para as ParaInternal);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      closeModal();
    }
    if (isOpen) {
      openModal();
    }
  }, [isOpen]);

  if (!isInitialized) {
    return null;
  }

  return <ParaModalInner ref={ref} para={para} {...rest} />;
});

const ParaModalInner = forwardRef<ParaModalHandle, ParaModalProps>(
  (
    {
      theme,
      appName,
      logo,
      disableEmailLogin = false,
      disablePhoneLogin = false,
      oAuthMethods,
      bareModal = false,
      className,
      currentStepOverride,
      externalWallets,
      authLayout = [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
      embeddedModal,
      onModalStepChange,
      hideWallets = false,
      onClose,
      ...rest
    }: ParaModalProps,
    ref,
  ) => {
    const modalContentRef = useRef<ModalContentHandle>(null);
    const updateThemeState = useThemeStore(state => state.updateState);
    const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
    const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
    const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
    const currentStep = useModalStore(state => state.step);
    const setOnModalStepChange = useModalStore(state => state.setOnModalStepChange);
    const setStep = useModalStore(state => state.setStep);
    const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
    const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
    const setFlow = useModalStore(state => state.setFlow);
    const setIsFullyLoggedIn = useModalStore(state => state.setIsFullyLoggedIn);
    const goBack = useGoBack();
    const setAuthLayout = useThemeStore(state => state.setAuthLayout);
    const storedAuthLayout = useThemeStore(state => state.authLayout);
    const resetModalState = useModalStore(state => state.resetState);
    const resetUserInfoState = useUserInfoStore(state => state.resetState);
    const setRecoveryShare = useUserInfoStore(state => state.setRecoveryShare);
    const { disconnectExternalWallet } = useExternalWallets();
    const { isOpen, closeModal } = useModal();
    const para = useInternalClient();
    const { selectedWallet, setSelectedWallet } = useWalletState();

    const [isModalMounted, setIsModalMounted] = useState(false);
    const [isInit, setIsInit] = useState(false);

    useImperativeHandle(ref, () => {
      return {
        goBack() {
          goBack();
        },
        canGoBack() {
          return hasPreviousStep;
        },
        currentStep() {
          return currentStep;
        },
        handleModalClose() {
          modalContentRef?.current?.handleModalClose();
        },
      };
    }, [hasPreviousStep, currentStep]);

    // This will run on mount and on isOpen change but won't cause a rerender unless step or email changes
    const initModal = async () => {
      const isAccount = await para.isFullyLoggedIn();
      if (currentStepOverride) {
        setStep(ModalStep[currentStepOverride.toUpperCase()]);
      } else if (isAccount) {
        setFlow('account');
        setStep(ModalStep.ACCOUNT_MAIN);
        setIsFullyLoggedIn(true);
      } else {
        if (currentStep !== ModalStep.AUTH_MAIN && currentStep !== ModalStep.SECRET) {
          setStep(ModalStep.AUTH_MAIN);
          setFlow();
          setWebAuthURLForLogin();
          setWebAuthURLForCreate();
          setBiometricLocationHints();
        }

        // Disconnect external wallets if the user is not longer logged in
        await disconnectExternalWallet();
        setSelectedWallet({ id: undefined, type: undefined });
        setIsFullyLoggedIn(false);
      }

      switch (true) {
        case para.isEmail:
          setAuthInfo({ email: para.getEmail() });
          break;

        case para.isPhone:
          {
            const { phone, countryCode } = para.getPhone();
            setAuthInfo({ phone, countryCode: countryCode as CountryCallingCode });
          }
          break;

        case para.isFarcaster:
          setAuthInfo({ farcasterUsername: para.getFarcasterUsername() });
          break;

        case para.isTelegram:
          setAuthInfo({ telegramUserId: para.telegramUserId });

          if (!isAccount) {
            setStep(ModalStep.TELEGRAM_OAUTH);
          }
          break;
      }

      setIsInit(true);
    };

    useEffect(() => {
      let _authLayout = authLayout;

      // Removing unused auth layouts based on what auth methods are passed in
      if (!externalWallets?.length && hasExternalWallet(authLayout)) {
        _authLayout = _authLayout.filter(l => !l.includes('EXTERNAL'));
      }

      if (disableEmailLogin && disablePhoneLogin && !oAuthMethods?.length && hasEmbeddedAuth(authLayout)) {
        _authLayout = _authLayout.filter(l => !l.includes('AUTH'));
      }

      if (JSON.stringify(storedAuthLayout) !== JSON.stringify(_authLayout)) {
        setAuthLayout(_authLayout);
      }
    }, [disableEmailLogin, disablePhoneLogin, oAuthMethods, externalWallets, authLayout]);

    useEffect(() => {
      setOnModalStepChange(onModalStepChange);
    }, [onModalStepChange]);

    useEffect(() => {
      updateThemeState({
        logo,
        appName,
        oAuthLogoVariant: theme?.oAuthLogoVariant ?? 'default',
        bareModal,
        embeddedModal,
        hideWallets,
      });
    }, [logo, appName, theme?.oAuthLogoVariant, bareModal, embeddedModal, hideWallets]);

    useEffect(() => {
      if (theme) {
        generateTheme(theme);
        updateThemeState({ isDark: theme.mode === 'dark', theme: theme });
      }
    }, [theme]);

    // Set Para instance & init on mount
    useEffect(() => {
      if (para) {
        initModal();

        if (bareModal) {
          setIsModalMounted(true);
        }
      } else {
        console.error('A Para instance must be provided.');
      }
    }, []);

    // Init modal with proper steps on isOpen change
    useEffect(() => {
      if (isOpen && para) {
        initModal();
      }
    }, [isOpen]);

    const updateActiveWallet = () => {
      if (!selectedWallet?.id || !para.findWallet(selectedWallet?.id)) {
        const defaultWallet = para.findWallet(undefined, undefined, { forbidPregen: true });

        setSelectedWallet({ id: defaultWallet?.id, type: defaultWallet?.type });
      }
    };

    useEffect(() => {
      updateActiveWallet();
    }, [para]);

    useEffect(() => {
      // TODO: remove this redundant listener once we force the use of the ParaProvider
      window.addEventListener(ParaEvent.WALLETS_CHANGE_EVENT, updateActiveWallet);
      window.addEventListener(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, updateActiveWallet);

      return () => {
        window.removeEventListener(ParaEvent.WALLETS_CHANGE_EVENT, updateActiveWallet);
        window.removeEventListener(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, updateActiveWallet);
      };
    }, []);

    const handleClose = () => {
      closeModal();
      onClose?.();
    };

    const handleModalEntering = () => {
      setIsModalMounted(true);
    };

    const handleModalExited = async () => {
      setIsModalMounted(false);
      if (RESET_TO_AUTH_STEPS.includes(currentStep)) {
        resetModalState();
        resetUserInfoState();
        setRecoveryShare(null);
      } else if (RESET_TO_ACCOUNT_STEPS.includes(currentStep)) {
        setStep(ModalStep.LOGIN_DONE);
      }

      if (para) {
        await initModal();
        para.exitLoops();
      }

      setIsInit(false);
    };

    if (!para) {
      console.error('A Para instance is required.');
      return null;
    }

    if (!storedAuthLayout?.length) {
      // Checking props here to verify a valid configuration was passed in.
      // Doing this since we auto adjust the auth layouts based on passed in auth method props, if an empty storedAuthLayout was triggered based on invalid props we want to be sure the message reflects that correctly.
      const hasExternalWalletError = !externalWallets?.length && hasExternalWallet(authLayout);
      const hasEmbeddedWalletError =
        disableEmailLogin && disablePhoneLogin && !oAuthMethods?.length && hasEmbeddedAuth(authLayout);

      if (hasExternalWalletError || hasEmbeddedWalletError) {
        if (hasExternalWalletError) {
          console.error('At least one external wallet must be provided if external wallet auth is enabled.');
        }

        if (hasEmbeddedWalletError) {
          console.error(
            'At least one login method (email, phone or OAuth) must be provided if embedded wallet auth is enabled.',
          );
        }
      } else {
        console.error('At least one auth layout selection is required.');
      }

      return null;
    }

    return (
      <ExternalWalletsWrapper wallets={externalWallets}>
        <StyledAuthModal
          enterTransitionDuration={DEFAULTS.ANIMATION_DURATION}
          exitTransitionDuration={DEFAULTS.ANIMATION_DURATION}
          open={isOpen}
          onCpslModalExited={handleModalExited}
          onCpslModalEntering={handleModalEntering}
          onCpslModalRequestClose={handleClose}
          noOverlay={bareModal}
          className={className}
          data-testid="modal"
          $embeddedModal={embeddedModal}
        >
          {/* wait to show the modal content until initialized only when using embedded modal for rainbowkit to avoid unexpected modal closures */}
          {isModalMounted && ((isInit && embeddedModal) || !embeddedModal) && (
            <ModalContent
              oAuthMethods={oAuthMethods}
              disableEmailLogin={disableEmailLogin}
              disablePhoneLogin={disablePhoneLogin}
              onClose={handleClose}
              {...rest}
            />
          )}
        </StyledAuthModal>
      </ExternalWalletsWrapper>
    );
  },
);

const StyledAuthModal = styled(CpslAuthModal)<{ $embeddedModal: boolean }>`
  ${({ $embeddedModal }) =>
    $embeddedModal &&
    `
    &::part(modal-body-card) {
    --card-box-shadow: none;
    --card-border-width: 0px;
  };

  &::part(modal-footer) {
    --card-box-shadow: none;
    --card-border-width: 0px;
  };`}
`;
