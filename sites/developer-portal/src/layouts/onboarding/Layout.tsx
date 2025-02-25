import { useLocation, useOutlet, useSearchParams } from 'react-router-dom';
import { AuthMinAppBar } from '../../components/AppBar/AuthMinAppBar';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { styled } from 'styled-components';
import { GradientProgressBar } from '../../components/GradientProgessBar/GradientProgessBar';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import { cloneElement, useEffect, useRef } from 'react';
import { useAccount } from '@getpara/react-sdk';

export const ONBOARDING_MOTION_VARIANTS: Variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
    transitionEnd: {
      // temp workaround to fix trailing opacity and transform
      opacity: 1,
      x: 0,
    },
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

export const ONBOARDING_TRANSITION: Transition = {
  duration: 0.1,
};

export const Layout = () => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { data: account } = useAccount();
  const userId = account?.userId;
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const element = useOutlet();

  const isInvite = pathname === '/onboarding/invite';
  const hasInvite = searchParams.get('invite');

  // Excluding plan step here since it doesn't contain a progress bar
  const totalSteps = Object.values(OnboardingStep).length + (hasInvite ? 1 : 0) - 1;
  const currentStepIndex = Object.keys(OnboardingStep).indexOf(currentStep ?? '');
  const currentStepModifier = hasInvite ? 2 : 1;
  const currentStepNumber = isInvite ? 1 : (currentStepIndex === -1 ? 0 : currentStepIndex) + currentStepModifier;

  const previousStepNumber = useRef(currentStepNumber);

  useEffect(() => {
    if (previousStepNumber.current !== currentStepNumber) {
      previousStepNumber.current = currentStepNumber;
    }
  }, [currentStepNumber]);

  const stepDirection = previousStepNumber.current < currentStepNumber ? 1 : -1;

  return (
    <AuthenticatedWrapper>
      <AuthMinAppBar />
      <OnboardingMain>
        <SentryErrorBoundary
          fallback={({ error, resetError }) => (
            <ErrorBoundary
              onResetError={resetError}
              variant="error"
              containerType="unauthenticated"
              errorMessage={(error as Error)?.message}
            />
          )}
        >
          <GradientProgressBar current={currentStepNumber} max={totalSteps} maxWidth={210} />
          <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
            <MotionContainer
              key={location.pathname}
              variants={ONBOARDING_MOTION_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={ONBOARDING_TRANSITION}
              custom={stepDirection}
            >
              {/* https://medium.com/@antonio.falcescu/animating-react-pages-with-react-router-dom-outlet-and-framer-motion-animatepresence-bd5438b3433b */}
              {element && cloneElement(element, { key: location.pathname })}
            </MotionContainer>
          </AnimatePresence>
        </SentryErrorBoundary>
      </OnboardingMain>
    </AuthenticatedWrapper>
  );
};

const MotionContainer = styled(motion.div)`
  will-change: auto !important;
`;

const OnboardingMain = styled.main`
  overflow: auto;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  background-color: var(--cpsl-color-background-0);
  box-sizing: border-box;
  padding: 40px 24px 24px 24px;
`;
