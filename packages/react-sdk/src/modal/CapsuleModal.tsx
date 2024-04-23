import {
  CpslModal,
  defineCustomElements,
  generateTheme,
} from '@usecapsule/react-components';

import '@usecapsule/react-components/css/capsule-core.css';
import './css/modal.css';
import { ModalContent } from './components/index.js';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  useCapsuleStore,
  useModalStore,
  useUserInfoStore,
  useThemeStore,
} from './stores/index.js';
import { ModalStep } from './utils/steps.js';
import { CapsuleModalProps } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';

gsap.registerPlugin(useGSAP);
defineCustomElements();

export const CapsuleModal = ({
  capsule,
  isOpen,
  theme,
  appName,
  logo,
  disableEmailLogin = false,
  oAuthMethods,
  onClose,
  ...rest
}: CapsuleModalProps) => {
  const updateThemeState = useThemeStore((state) => state.updateState);
  const currentStep = useModalStore((state) => state.step);
  const setStep = useModalStore((state) => state.setStep);
  const setCapsule = useCapsuleStore((state) => state.setCapsule);
  const setEmail = useUserInfoStore((state) => state.setEmail);

  const [isModalMounted, setIsModalMounted] = useState(false);
  const [hasFinishedAnimation, setHasFinishedAnimation] = useState(false);
  const [modalExpanded, setModalExpanded] = useState(false);

  // This will run on mount and on isOpen change but won't cause a rerender unless step or email changes
  const initModal = async () => {
    if (await capsule.isFullyLoggedIn()) {
      setStep(ModalStep.LOGIN_DONE);
    } else if (
      currentStep === ModalStep.LOGIN_DONE ||
      currentStep === ModalStep.TWO_FACTOR_DONE ||
      currentStep === ModalStep.SETUP_2FA ||
      currentStep === ModalStep.SECRET
    ) {
      setStep(ModalStep.SIGN_UP);
    }

    setEmail(capsule.getEmail());
  };

  useEffect(() => {
    updateThemeState({ logo, appName });
  }, [logo, appName]);

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

  if (disableEmailLogin && !oAuthMethods?.length) {
    console.error(
      'At least one OAuth method must be provided if email login is disabled.',
    );
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
    >
      {isModalMounted && (
        <ModalContent
          hasFinishedAnimation={hasFinishedAnimation}
          oAuthMethods={oAuthMethods}
          disableEmailLogin={disableEmailLogin}
          setModalExpanded={setModalExpanded}
          onClose={onClose}
          {...rest}
        />
      )}
    </CpslModal>
  );
};
