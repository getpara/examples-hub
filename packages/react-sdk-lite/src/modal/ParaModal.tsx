import { CpslAuthModal, defineCustomElements, generateTheme } from '@getpara/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModalStore } from './stores/index.js';
import { ModalStep, RESET_TO_ACCOUNT_STEPS, RESET_TO_AUTH_STEPS } from './utils/steps.js';
import { AuthLayout, ParaModalHandle, ParaModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import { safeStyled } from '@getpara/react-common';
import { hasEmbeddedAuth, hasExternalWallet } from './utils/authLayoutHelpers.js';
import { useAccount, useModal, useParaStatus, useWalletState } from '../provider/index.js';
import { useInternalClient } from '../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../provider/stores/useStore.js';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { useAuthActions } from '../provider/providers/AuthProvider.js';
import { validateInput } from './utils/authInputHelpers.js';
import { SDK_VERSION } from './constants/constants.js';

defineCustomElements();

export const ParaModal = forwardRef<ParaModalHandle, ParaModalProps>((props, ref) => {
  const storedModalConfig = useStore(state => state.modalConfig);
  const openedToStep = useStore(state => state.openedToStep);
  const modalContentRef = useRef<ModalContentHandle>(null);
  const refs = useModalStore(state => state.refs);
  const flow = useModalStore(state => state.flow);
  const currentStep = useModalStore(state => state.step);
  const setAuthState = useModalStore(state => state.setAuthState);
  const setOnModalStepChange = useModalStore(state => state.setOnModalStepChange);
  const setStep = useModalStore(state => state.setStep);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const setFlow = useModalStore(state => state.setFlow);
  const goBack = useGoBack();
  const setAuthLayout = useModalStore(state => state.setAuthLayout);
  const storedAuthLayout = useModalStore(state => state.authLayout);
  const resetModalState = useModalStore(state => state.resetState);
  const setRecoveryShare = useModalStore(state => state.setRecoveryShare);
  const { disconnectExternalWallet } = useExternalWallets();
  const { isOpen: storedIsOpen, closeModal } = useModal();
  const para = useInternalClient();
  const { setSelectedWallet, updateSelectedWallet } = useWalletState();
  const setAuthStepRoute = useModalStore(state => state.setAuthStepRoute);
  const { signUpOrLogIn, isCreateGuestWalletsPending } = useAuthActions();
  const { isReady, isFarcasterMiniApp } = useParaStatus();
  const { isLoading: isAccountLoading, isConnected, embedded } = useAccount();
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);

  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const externalWallets = useStore(state => state.externalWallets);
  const providerProps = useStore(state => state.providerProps);
  const setAccountLinkOptions = useModalStore(state => state.setAccountLinkOptions);

  const isInitialized = useRef(false);

  // Merge props stored on the provider with props passed to the modal, favoring props passed to modal
  const {
    isOpen: configIsOpen,
    theme,
    disableEmailLogin = false,
    disablePhoneLogin = false,
    isGuestModeEnabled = false,
    oAuthMethods = ['GOOGLE', 'TWITTER'],
    bareModal = false,
    className,
    currentStepOverride,
    authLayout = [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
    embeddedModal,
    onModalStepChange,
    onClose,
    defaultAuthIdentifier,
    supportedAccountLinks: propsSupportedAccountLinks,
    ...rest
  } = { ...storedModalConfig, ...props };

  useEffect(() => {
    const trackAnalytics = async () => {
      try {
        await para.ctx.client.trackReactSdkAnalytics({
          props: {
            ...providerProps,
            theme,
            disableEmailLogin,
            disablePhoneLogin,
            isGuestModeEnabled,
            oAuthMethods,
            bareModal,
            className,
            currentStepOverride,
            authLayout,
            embeddedModal,
            onModalStepChange,
            onClose,
            defaultAuthIdentifier,
            ...rest,
          },
          reactSdkVersion: SDK_VERSION,
        });
      } catch (_) {
        // fail silently
      }
    };
    trackAnalytics();
  }, []);

  const isOpen = configIsOpen ?? storedIsOpen;

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
  const initModal = async (shouldAutoLogin?: boolean) => {
    if (!isReady) {
      return;
    }
    setIFrameUrl(undefined);
    setIsIFrameReady(false);

    const isAccount = isConnected,
      isGuest = (isAccount && para.isGuestMode) || isCreateGuestWalletsPending;

    switch (true) {
      case !!currentStepOverride:
        setStep(ModalStep[currentStepOverride.toUpperCase()]);
        break;
      case isGuest:
        setFlow('guest');
        setStep(isCreateGuestWalletsPending ? ModalStep.AWAITING_GUEST_WALLET_CREATION : ModalStep.ACCOUNT_MAIN);
        break;
      case isAccount:
        setFlow('account');
        if (!openedToStep.current) {
          setStep(ModalStep.ACCOUNT_MAIN);
        }
        break;
      default:
        if (currentStep !== ModalStep.AUTH_MAIN && currentStep !== ModalStep.SECRET) {
          setFlow(undefined);
          setStep(para.isTelegram ? ModalStep.TELEGRAM_OAUTH : ModalStep.AUTH_MAIN);
          setAuthState();
          setAuthStepRoute();
        }

        // Disconnect external wallets if the user is not longer logged in
        if (!isFarcasterMiniApp) {
          await disconnectExternalWallet();
          setSelectedWallet({ id: undefined, type: undefined });
        }

        if (shouldAutoLogin) {
          if (defaultAuthIdentifier && para.authInfo?.identifier !== defaultAuthIdentifier) {
            const number = parsePhoneNumberFromString(defaultAuthIdentifier);

            try {
              const auth = validateInput(
                number ? number.nationalNumber : defaultAuthIdentifier,
                number?.countryCallingCode ? `+${number?.countryCallingCode}` : undefined,
                number ? 'phone' : 'email',
              );
              para.setAuth(number ? { phone: defaultAuthIdentifier as `+${number}` } : { email: defaultAuthIdentifier });

              signUpOrLogIn(auth);
            } catch (err) {
              console.error('invalid user identifier:', err.message);
            }
          }
        }
        break;
    }
  };

  useEffect(() => {
    if (isReady && isOpen && !isAccountLoading && !isInitialized.current) {
      initModal(isOpen);
      isInitialized.current = true;
    }

    if (!bareModal && isReady && !isOpen && isInitialized.current) {
      setTimeout(() => {
        initModal();
        isInitialized.current = false;
      }, 250);
    }
  }, [bareModal, isReady, isOpen, isAccountLoading]);

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
  }, [disableEmailLogin, disablePhoneLogin, oAuthMethods, externalWallets, authLayout, storedAuthLayout]);

  useEffect(() => {
    if (theme) {
      generateTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    setOnModalStepChange(onModalStepChange);
  }, [onModalStepChange]);

  useEffect(() => {
    updateSelectedWallet();
  }, [para]);

  useEffect(() => {
    if (
      bareModal &&
      !isAccountLoading &&
      !isConnected &&
      !['signup', 'login'].includes(flow ?? '') &&
      refs.currentStep.current !== ModalStep.AUTH_MAIN
    ) {
      setStep(ModalStep.AUTH_MAIN);
    }
  }, [bareModal, flow, isConnected, isAccountLoading]);

  useEffect(() => {
    setAccountLinkOptions(propsSupportedAccountLinks ?? para?.supportedAccountLinks);
  }, [propsSupportedAccountLinks, para?.supportedAccountLinks]);

  const handleClose = () => {
    closeModal();
    onClose?.();
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    handleClose();

    const reset = async () => {
      await para.logout({ clearPregenWallets: embedded?.isGuestMode });
      await disconnectExternalWallet();

      setStep(ModalStep.AUTH_MAIN);
      setFlow(undefined);
      setIsDisconnecting(false);
    };

    if (bareModal) {
      reset();
      return;
    }

    setTimeout(() => {
      reset();
    }, 250);
  };

  const handleModalEntering = () => {
    setIsModalMounted(true);
  };

  const handleModalExited = async () => {
    openedToStep.current = null;
    setIsModalMounted(false);
    if (RESET_TO_AUTH_STEPS.includes(currentStep)) {
      resetModalState();
      setRecoveryShare(null);
    } else if (RESET_TO_ACCOUNT_STEPS.includes(currentStep)) {
      setStep(ModalStep.LOGIN_DONE);
    }
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
      $embeddedModal={!!embeddedModal}
    >
      {/* wait to show the modal content until initialized only when using embedded modal for rainbowkit to avoid unexpected modal closures */}
      {isModalMounted && (((embeddedModal || bareModal) && isInitialized.current) || (!embeddedModal && !bareModal)) && (
        <ModalContent
          oAuthMethods={oAuthMethods}
          disableEmailLogin={disableEmailLogin}
          disablePhoneLogin={disablePhoneLogin}
          isGuestModeEnabled={isGuestModeEnabled}
          onClose={handleClose}
          onDisconnect={handleDisconnect}
          isDisconnecting={isDisconnecting}
          {...rest}
        />
      )}
    </StyledAuthModal>
  );
});

const StyledAuthModal = safeStyled(CpslAuthModal)<{ $embeddedModal: boolean }>`
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
