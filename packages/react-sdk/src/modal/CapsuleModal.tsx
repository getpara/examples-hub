import { CpslAuthModal, defineCustomElements, generateTheme } from '@usecapsule/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore, useThemeStore } from './stores/index.js';
import { ModalStep } from './utils/steps.js';
import { AuthLayout, CapsuleModalHandle, CapsuleModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import { CURRENT_WALLET_IDS_CHANGE_EVENT, EXTERNAL_WALLET_CHANGE_EVENT } from '@usecapsule/web-sdk';
import { ExternalWalletsWrapper } from './components/ExternalWalletsWrapper/ExternalWalletsWrapper.js';
import { CountryCallingCode } from 'libphonenumber-js';
import styled from 'styled-components';
import { useExternalWallets } from './providers/ExternalWalletContext.js';

defineCustomElements();

export const CapsuleModal = forwardRef<CapsuleModalHandle, CapsuleModalProps>(
  (
    {
      capsule,
      isOpen,
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
      onClose,
      ...rest
    }: CapsuleModalProps,
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
    const setCapsule = useCapsuleStore(state => state.setCapsule);
    const setIdentifier = useUserInfoStore(state => state.setIdentifier);
    const setIdentifierType = useUserInfoStore(state => state.setIdentifierType);
    const setCountryCode = useUserInfoStore(state => state.setCountryCode);
    const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
    const setFlow = useModalStore(state => state.setFlow);
    const setIsFullyLoggedIn = useModalStore(state => state.setIsFullyLoggedIn);
    const goBack = useGoBack();
    const setAuthLayout = useThemeStore(state => state.setAuthLayout);
    const resetModalState = useModalStore(state => state.resetState);
    const resetUserInfoState = useUserInfoStore(state => state.resetState);
    const setRecoveryShare = useUserInfoStore(state => state.setRecoveryShare);
    const [activeWallet, setActiveWallet] = useModalStore(state => [state.activeWallet, state.setActiveWallet]);
    const { disconnectExternalWallet } = useExternalWallets();

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
      if (currentStepOverride) {
        setStep(ModalStep[currentStepOverride.toUpperCase()]);
      } else if (await capsule.isFullyLoggedIn()) {
        setFlow('account');
        setStep(ModalStep.ACCOUNT_MAIN);
        setIsFullyLoggedIn(true);
      } else {
        if (
          currentStep === ModalStep.ACCOUNT_MAIN ||
          currentStep === ModalStep.LOGIN_DONE ||
          currentStep === ModalStep.TWO_FACTOR_DONE ||
          currentStep === ModalStep.SETUP_2FA ||
          currentStep === ModalStep.SECRET ||
          currentStep === ModalStep.BIOMETRIC_LOGIN ||
          currentStep === ModalStep.BIOMETRIC_CREATION ||
          currentStep === ModalStep.WALLET_CREATION_DONE ||
          currentStep === ModalStep.EX_WALLET_SELECTED
        ) {
          setStep(ModalStep.AUTH_MAIN);
          setFlow();
          setWebAuthURLForLogin();
          setWebAuthURLForCreate();
          setBiometricLocationHints();
        }

        // Disconnect external wallets if the user is not longer logged in
        await disconnectExternalWallet();
        setActiveWallet([undefined, undefined]);
        setIsFullyLoggedIn(false);
      }

      const email = capsule.getEmail();
      if (email) {
        setIdentifier(email);
        setIdentifierType('email');
      }

      const { phone, countryCode } = capsule.getPhone();
      if (phone) {
        setIdentifier(phone);
        setCountryCode(countryCode as CountryCallingCode);
        setIdentifierType('phone');
      }

      if (capsule.isFarcaster) {
        setIdentifier(capsule.getFarcasterUsername());
        setIdentifierType('farcaster');
      }

      setIsInit(true);
    };

    useEffect(() => {
      setAuthLayout(authLayout && !externalWallets?.length ? authLayout.filter(l => !l.includes('EXTERNAL')) : authLayout);
    }, [externalWallets, authLayout]);

    useEffect(() => {
      setOnModalStepChange(onModalStepChange);
    }, [onModalStepChange]);

    useEffect(() => {
      updateThemeState({ logo, appName, oAuthLogoVariant: theme?.oAuthLogoVariant ?? 'default', bareModal, embeddedModal });
    }, [logo, appName, theme?.oAuthLogoVariant, bareModal, embeddedModal]);

    useEffect(() => {
      if (theme) {
        generateTheme(theme);
        updateThemeState({ isDark: theme.mode === 'dark', theme: theme });
      }
    }, [theme]);

    // Set Capsule instance & init on mount
    useEffect(() => {
      if (capsule) {
        initModal();
        setCapsule(capsule);

        if (bareModal) {
          setIsModalMounted(true);
        }
      } else {
        console.error('A Capsule instance must be provided.');
      }
    }, []);

    // Init modal with proper steps on isOpen change
    useEffect(() => {
      if (isOpen && capsule) {
        initModal();
      }
    }, [isOpen]);

    const updateActiveWallet = () => {
      if (!activeWallet[0] || !capsule.findWallet(activeWallet[0])) {
        const defaultWallet = capsule.findWallet(undefined, undefined, { forbidPregen: true });
        defaultWallet && setActiveWallet([defaultWallet.id, defaultWallet.type]);
      }
    };

    useEffect(() => {
      setCapsule(capsule);

      updateActiveWallet();
    }, [capsule]);

    useEffect(() => {
      window.addEventListener(CURRENT_WALLET_IDS_CHANGE_EVENT, updateActiveWallet);
      window.addEventListener(EXTERNAL_WALLET_CHANGE_EVENT, updateActiveWallet);

      return () => {
        window.removeEventListener(CURRENT_WALLET_IDS_CHANGE_EVENT, updateActiveWallet);
        window.removeEventListener(EXTERNAL_WALLET_CHANGE_EVENT, updateActiveWallet);
      };
    }, []);

    const handleModalEntering = () => {
      setIsModalMounted(true);
    };

    const handleModalExited = async () => {
      setIsModalMounted(false);
      if (
        currentStep === ModalStep.LOGIN_DONE ||
        currentStep === ModalStep.TWO_FACTOR_DONE ||
        currentStep === ModalStep.SETUP_2FA ||
        currentStep === ModalStep.SECRET ||
        currentStep === ModalStep.BIOMETRIC_LOGIN ||
        currentStep === ModalStep.BIOMETRIC_CREATION ||
        currentStep === ModalStep.WALLET_CREATION_DONE ||
        currentStep === ModalStep.EX_WALLET_SELECTED ||
        currentStep === ModalStep.AWAITING_BIOMETRIC_CREATION ||
        currentStep === ModalStep.AWAITING_BIOMETRIC_LOGIN
      ) {
        resetModalState();
        resetUserInfoState();
        setRecoveryShare(null);
      } else if (
        currentStep === ModalStep.ADD_FUNDS ||
        currentStep === ModalStep.ADD_FUNDS_AWAITING ||
        currentStep === ModalStep.ADD_FUNDS_SUCCESS ||
        currentStep === ModalStep.ADD_FUNDS_FAILURE
      ) {
        setStep(ModalStep.LOGIN_DONE);
      }

      if (capsule) {
        await initModal();
        capsule.exitLoops();
      }

      setIsInit(false);
    };

    if (!capsule) {
      return null;
    }

    if (disableEmailLogin && disablePhoneLogin && !oAuthMethods?.length && !externalWallets?.length) {
      console.error('At least one OAuth method must be provided if email and phone login are disabled.');
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
          onCpslModalRequestClose={onClose}
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
              onClose={onClose}
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
