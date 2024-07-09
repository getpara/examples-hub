import { CpslModal, defineCustomElements, generateTheme } from '@usecapsule/react-components';

import { ModalContent, ModalContentHandle } from './components/index.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCapsuleStore, useModalStore, useUserInfoStore, useThemeStore } from './stores/index.js';
import { ModalStep } from './utils/steps.js';
import { CapsuleModalHandle, CapsuleModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';
import { useGoBack } from './hooks/useGoBack.js';
import { Network, getNetwork } from '@usecapsule/web-sdk';

gsap.registerPlugin(useGSAP);
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
      onModalStepChange,
      onExpandModalChange,
      onClose,
      ...rest
    }: CapsuleModalProps,
    ref,
  ) => {
    const modalContentRef = useRef<ModalContentHandle>(null);
    const updateThemeState = useThemeStore((state) => state.updateState);
    const setWebAuthURLForLogin = useModalStore((state) => state.setWebAuthURLForLogin);
    const setWebAuthURLForCreate = useModalStore((state) => state.setWebAuthURLForCreate);
    const currentStep = useModalStore((state) => state.step);
    const setOnModalStepChange = useModalStore((state) => state.setOnModalStepChange);
    const setOnRampConfig = useModalStore((state) => state.setOnRampConfig);
    const setNetworks = useModalStore((state) => state.setNetworks);
    const setStep = useModalStore((state) => state.setStep);
    const setCapsule = useCapsuleStore((state) => state.setCapsule);
    const setEmail = useUserInfoStore((state) => state.setEmail);
    const hasPreviousStep = useModalStore((state) => state.hasPreviousStep());
    const goBack = useGoBack();

    const [isModalMounted, setIsModalMounted] = useState(false);
    const [hasFinishedAnimation, setHasFinishedAnimation] = useState(false);
    const [modalExpanded, setModalExpanded] = useState(false);

    useImperativeHandle(
      ref,
      () => {
        return {
          goBack() {
            goBack();
          },
          canGoBack() {
            return hasPreviousStep;
          },
          isModalExpanded() {
            return modalExpanded;
          },
          toggleModalExpanded() {
            setModalExpanded((curr) => !curr);
          },
          currentStep() {
            return currentStep;
          },
          handleModalClose() {
            modalContentRef?.current?.handleModalClose();
          },
        };
      },
      [hasPreviousStep, modalExpanded, currentStep],
    );

    // This will run on mount and on isOpen change but won't cause a rerender unless step or email changes
    const initModal = async () => {
      if (await capsule.isFullyLoggedIn()) {
        setStep(ModalStep.LOGIN_DONE);
      } else if (
        currentStep === ModalStep.LOGIN_DONE ||
        currentStep === ModalStep.TWO_FACTOR_DONE ||
        currentStep === ModalStep.SETUP_2FA ||
        currentStep === ModalStep.SECRET ||
        currentStep === ModalStep.BIOMETRIC_LOGIN ||
        currentStep === ModalStep.BIOMETRIC_CREATION ||
        currentStep === ModalStep.WALLET_CREATION_DONE
      ) {
        setStep(ModalStep.SIGN_UP);
        setWebAuthURLForLogin();
        setWebAuthURLForCreate();
      }

      setEmail(capsule.getEmail());
    };

    useEffect(() => {
      onExpandModalChange?.(modalExpanded);
    }, [modalExpanded]);

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
        const isDark = generateTheme(theme);
        updateThemeState({ isDark });
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
      if (capsule) {
        // If animating out, reset state after animation is done
        setTimeout(
          () => {
            initModal();
          },
          isOpen ? 0 : DEFAULTS.ANIMATION_DURATION * 1000,
        );
      }
    }, [isOpen]);

    const handleModalEntering = () => {
      setIsModalMounted(true);
    };

    const handleModalEntered = () => {
      setHasFinishedAnimation(true);
    };
    const handleModalExited = () => {
      setHasFinishedAnimation(false);
      setIsModalMounted(false);
    };

    if (!capsule) {
      return null;
    }

    if (disableEmailLogin && disablePhoneLogin && !oAuthMethods?.length) {
      console.error('At least one OAuth method must be provided if email and phone login are disabled.');
      return null;
    }

    return (
      <CpslModal
        enterTransitionDuration={DEFAULTS.ANIMATION_DURATION}
        exitTransitionDuration={DEFAULTS.ANIMATION_DURATION}
        footerExpanded={modalExpanded}
        open={isOpen}
        onCpslModalExited={handleModalExited}
        onCpslModalEntered={handleModalEntered}
        onCpslModalEntering={handleModalEntering}
        onCpslModalRequestClose={onClose}
        noOverlay={bareModal}
        className={className}
      >
        {isModalMounted && (
          <ModalContent
            hasFinishedAnimation={hasFinishedAnimation}
            oAuthMethods={oAuthMethods}
            disableEmailLogin={disableEmailLogin}
            disablePhoneLogin={disablePhoneLogin}
            setModalExpanded={setModalExpanded}
            onClose={onClose}
            {...rest}
          />
        )}
      </CpslModal>
    );
  },
);
