import { CpslAuthModal, defineCustomElements, generateTheme } from '@getpara/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModalStore } from './stores/index.js';
import { ModalStep, RESET_TO_ACCOUNT_STEPS, RESET_TO_AUTH_STEPS } from './utils/steps.js';
import { AuthLayout, ParaModalHandle, ParaModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import styled from 'styled-components';
import { hasEmbeddedAuth, hasExternalWallet } from './utils/authLayoutHelpers.js';
import { useModal, useWalletState } from '../provider/index.js';
import { useInternalClient } from '../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../provider/stores/useStore.js';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { useAuthActions } from '../provider/providers/AuthProvider.js';
import { validateAuth } from './utils/authInputHelpers.js';

defineCustomElements();

export const ParaModal = forwardRef<ParaModalHandle, ParaModalProps>((props, ref) => {
  const storedModalConfig = useStore(state => state.modalConfig);
  const modalContentRef = useRef<ModalContentHandle>(null);
  const currentStep = useModalStore(state => state.step);
  const setAuthState = useModalStore(state => state.setAuthState);
  const setOnModalStepChange = useModalStore(state => state.setOnModalStepChange);
  const setStep = useModalStore(state => state.setStep);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const setFlow = useModalStore(state => state.setFlow);
  const setIsFullyLoggedIn = useModalStore(state => state.setIsFullyLoggedIn);
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
  const { signUpOrLogIn } = useAuthActions();

  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isInit, setIsInit] = useState(false);
  const externalWallets = useStore(state => state.externalWallets);

  // Merge props stored on the provider with props passed to the modal, favoring props passed to modal
  const {
    isOpen: configIsOpen,
    theme,
    disableEmailLogin = false,
    disablePhoneLogin = false,
    oAuthMethods = ['GOOGLE', 'TWITTER'],
    bareModal = false,
    className,
    currentStepOverride,
    authLayout = [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
    embeddedModal,
    onModalStepChange,
    onClose,
    defaultAuthIdentifier,
    ...rest
  } = { ...storedModalConfig, ...props };

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
    const isAccount = await para.isFullyLoggedIn();
    if (currentStepOverride) {
      setStep(ModalStep[currentStepOverride.toUpperCase()]);
    } else if (isAccount) {
      setFlow('account');
      setStep(ModalStep.ACCOUNT_MAIN);
      setIsFullyLoggedIn(true);
    } else {
      if (currentStep !== ModalStep.AUTH_MAIN && currentStep !== ModalStep.SECRET) {
        setFlow(undefined);
        setStep(ModalStep.AUTH_MAIN);
        setAuthState();
        setAuthStepRoute();
      }

      // Disconnect external wallets if the user is not longer logged in
      await disconnectExternalWallet();
      setSelectedWallet({ id: undefined, type: undefined });
      setIsFullyLoggedIn(false);

      if (shouldAutoLogin) {
        if (defaultAuthIdentifier && para.authInfo?.identifier !== defaultAuthIdentifier) {
          const number = parsePhoneNumberFromString(defaultAuthIdentifier);

          try {
            const auth = validateAuth(
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
    }

    switch (true) {
      case para.isTelegram:
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
  }, [disableEmailLogin, disablePhoneLogin, oAuthMethods, externalWallets, authLayout, storedAuthLayout]);

  useEffect(() => {
    if (theme) {
      generateTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    setOnModalStepChange(onModalStepChange);
  }, [onModalStepChange]);

  // Set Para instance & init on mount
  useEffect(() => {
    if (para) {
      initModal();
    } else {
      console.error('A Para instance must be provided.');
    }
  }, []);

  // Init modal with proper steps on isOpen change
  useEffect(() => {
    if (isOpen && para) {
      initModal(true);
    }
  }, [isOpen]);

  useEffect(() => {
    updateSelectedWallet();
  }, [para]);

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
      setRecoveryShare(null);
    } else if (RESET_TO_ACCOUNT_STEPS.includes(currentStep)) {
      setStep(ModalStep.LOGIN_DONE);
    }

    if (para) {
      await initModal();
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
      {isModalMounted && (((embeddedModal || bareModal) && isInit) || (!embeddedModal && !bareModal)) && (
        <ModalContent
          oAuthMethods={oAuthMethods}
          disableEmailLogin={disableEmailLogin}
          disablePhoneLogin={disablePhoneLogin}
          onClose={handleClose}
          {...rest}
        />
      )}
    </StyledAuthModal>
  );
});

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
