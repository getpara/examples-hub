import {
  CpslOverlay,
  defineCustomElements,
} from '@usecapsule/react-components';

import '@usecapsule/react-components/css/capsule-core.css';
import './css/modal.css';
import styled from 'styled-components';
import { Modal } from './components/index.js';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Theme } from './types/theme.js';
import { useUpdateTheme } from './hooks/useUpdateTheme.js';
import { useCapsuleStore, useModalStore, useUserInfoStore } from './stores/index.js';
import { ModalStep } from './utils/steps.js';
import { CapsuleModalV2Props } from './types/modalProps.js';
import { DEFAULTS } from './constants/defaults.js';

gsap.registerPlugin(useGSAP);
defineCustomElements();

export const CapsuleModal = ({
  capsule,
  isOpen,
  theme = Theme.light,
  branding,
  appName,
  logo,
  logoDark,
  ...rest
}: CapsuleModalV2Props) => {
  useUpdateTheme({
    theme,
    branding,
    logo,
    logoDark,
    appName,
  });
  const currentStep = useModalStore((state) => state.step);
  const setStep = useModalStore((state) => state.setStep);
  const setCapsule = useCapsuleStore((state) => state.setCapsule);
  const setEmail = useUserInfoStore((state) => state.setEmail);

  const containerRef = useRef<HTMLCpslOverlayElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [hasFinishedAnimation, setHasFinishedAnimation] = useState(false);

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

  useGSAP(
    () => {
      if (isOpen) {
        gsap
          .timeline({
            onStart: () => {
              setIsModalMounted(true);
            },
            onComplete: () => {
              setHasFinishedAnimation(true);
            },
          })
          .to(wrapperRef.current, {
            scale: 1,
            duration: DEFAULTS.ANIMATION_DURATION,
          });
      } else {
        gsap
          .timeline({
            onComplete: () => {
              setIsModalMounted(false);
              setHasFinishedAnimation(false);
            },
          })
          .to(wrapperRef.current, {
            scale: 0.8,
            duration: DEFAULTS.ANIMATION_DURATION,
          });
      }
    },
    { scope: containerRef, dependencies: [isOpen] },
  );

  if (!capsule) {
    return null;
  }

  return (
    <CpslOverlay
      ref={containerRef}
      transitionDuration={DEFAULTS.ANIMATION_DURATION}
      open={isOpen}
    >
      <ModalWrapper ref={wrapperRef}>
        {isModalMounted && (
          <Modal hasFinishedAnimation={hasFinishedAnimation} {...rest} />
        )}
      </ModalWrapper>
    </CpslOverlay>
  );
};

const ModalWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  scale: 0.8;
`;
