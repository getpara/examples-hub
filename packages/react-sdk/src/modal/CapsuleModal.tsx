import { CpslAuthModal, defineCustomElements, generateTheme } from '@usecapsule/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore, useThemeStore } from './stores/index.js';
import { ModalStep } from './utils/steps.js';
import { AuthLayout, CapsuleModalHandle, CapsuleModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import { Network, getNetwork } from '@usecapsule/web-sdk';
import { ExternalWalletsWrapper } from './components/ExternalWalletsWrapper/ExternalWalletsWrapper.js';
import { CountryCallingCode } from 'libphonenumber-js';
import { WalletProvider } from './providers/WalletContext.js';

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
      onRampConfig,
      networks = [Network.ETHEREUM],
      currentStepOverride,
      externalWallets,
      authLayout = [AuthLayout.AUTH_FULL, AuthLayout.EXTERNAL_FULL],
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
    const currentStep = useModalStore(state => state.step);
    const setOnModalStepChange = useModalStore(state => state.setOnModalStepChange);
    const setOnRampConfig = useModalStore(state => state.setOnRampConfig);
    const setNetworks = useModalStore(state => state.setNetworks);
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

    const [isModalMounted, setIsModalMounted] = useState(false);
    const [hasFinishedAnimation, setHasFinishedAnimation] = useState(false);

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
        }

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
    };

    useEffect(() => {
      setAuthLayout(authLayout);
    }, [authLayout]);

    useEffect(() => {
      setOnModalStepChange(onModalStepChange);
    }, [onModalStepChange]);

    useEffect(() => {
      setOnRampConfig(onRampConfig);
    }, [onRampConfig]);

    useEffect(() => {
      setNetworks(networks.map(getNetwork));
    }, [networks]);

    useEffect(() => {
      updateThemeState({ logo, appName, oAuthLogoVariant: theme?.oAuthLogoVariant ?? 'default', bareModal });
    }, [logo, appName, theme?.oAuthLogoVariant, bareModal]);

    useEffect(() => {
      if (theme) {
        generateTheme(theme);
        updateThemeState({ isDark: theme.mode === 'dark' });
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

    useEffect(() => {
      setCapsule(capsule);
    }, [capsule]);

    // Init modal with proper steps on isOpen change
    useEffect(() => {
      if (isOpen && capsule) {
        initModal();
      }
    }, [isOpen]);

    const handleModalEntering = () => {
      setIsModalMounted(true);
    };

    const handleModalEntered = () => {
      setHasFinishedAnimation(true);
    };

    const handleModalExited = async () => {
      setHasFinishedAnimation(false);
      setIsModalMounted(false);
      if (
        currentStep === ModalStep.LOGIN_DONE ||
        currentStep === ModalStep.TWO_FACTOR_DONE ||
        currentStep === ModalStep.SETUP_2FA ||
        currentStep === ModalStep.SECRET ||
        currentStep === ModalStep.BIOMETRIC_LOGIN ||
        currentStep === ModalStep.BIOMETRIC_CREATION ||
        currentStep === ModalStep.WALLET_CREATION_DONE ||
        currentStep === ModalStep.EX_WALLET_SELECTED
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
        initModal();
        capsule.exitLoops();
      }
    };

    if (!capsule) {
      return null;
    }

    if (disableEmailLogin && disablePhoneLogin && !oAuthMethods?.length) {
      console.error('At least one OAuth method must be provided if email and phone login are disabled.');
      return null;
    }

    return (
      <ExternalWalletsWrapper wallets={externalWallets}>
        <CpslAuthModal
          enterTransitionDuration={DEFAULTS.ANIMATION_DURATION}
          exitTransitionDuration={DEFAULTS.ANIMATION_DURATION}
          open={isOpen}
          onCpslModalExited={handleModalExited}
          onCpslModalEntered={handleModalEntered}
          onCpslModalEntering={handleModalEntering}
          onCpslModalRequestClose={onClose}
          noOverlay={bareModal}
          className={className}
          data-testid="modal"
        >
          {isModalMounted && (
            <WalletProvider>
              <ModalContent
                hasFinishedAnimation={hasFinishedAnimation}
                oAuthMethods={oAuthMethods}
                disableEmailLogin={disableEmailLogin}
                disablePhoneLogin={disablePhoneLogin}
                onClose={onClose}
                {...rest}
              />
            </WalletProvider>
          )}
        </CpslAuthModal>
      </ExternalWalletsWrapper>
    );
  },
);
