import styled from 'styled-components';
import { para } from '../../clients/para';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { useGetAllOrganizations } from '../../hooks/api/queries/useOrganizations';
import { PlanSelect } from './components/PlanSelect';
import { useEffect } from 'react';
import { MainLoader } from '../../components/MainLoader';
import { AUTH_MIN_APP_BAR_HEIGHT } from '../../components/AppBar/AuthMinAppBar';
import { AboutYou } from './components/AboutYou';
import { AboutProject } from './components/AboutProject';
import { OrgInfo } from './components/OrgInfo';
import { AnimatePresence, motion } from 'framer-motion';
import { ONBOARDING_MOTION_VARIANTS, ONBOARDING_TRANSITION } from '../../layouts/onboarding/Layout';
import { useOnboardingForm } from './hooks/useOnboardingForm';
import { FormProvider } from 'react-hook-form';
import { aboutProjectQuestions, aboutYouQuestions, orgQuestions } from './config/questionConfig';

export const Onboarding = () => {
  const form = useOnboardingForm();
  const userId = para.getUserId();
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const setStep = useOnboardingStore(state => state.setStep);
  const direction = useOnboardingStore(state => state.direction);
  const { data: allOrgs, isLoading: isOrgsLoading } = useGetAllOrganizations();

  const aboutYouValues = form.watch(aboutYouQuestions) as any[];
  const aboutYouComplete = aboutYouValues.every(v => !!v?.length);
  const aboutProjectValues = form.watch(aboutProjectQuestions) as any[];
  const aboutProjectComplete = aboutProjectValues.every(v => !!v?.length);
  const orgValues = form.watch(orgQuestions) as any[];
  const orgComplete = orgValues.every(v => !!v?.length);

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!aboutYouComplete && currentStep !== OnboardingStep.ABOUT_YOU) {
      setStep(userId, OnboardingStep.ABOUT_YOU);
    }

    if (
      aboutYouComplete &&
      !aboutProjectComplete &&
      (currentStep === OnboardingStep.ORG_INFO || currentStep === OnboardingStep.PLAN_SELECT)
    ) {
      setStep(userId, OnboardingStep.ABOUT_PROJECT);
    }

    if (aboutYouComplete && aboutProjectComplete && !orgComplete && currentStep === OnboardingStep.PLAN_SELECT) {
      setStep(userId, OnboardingStep.ORG_INFO);
    }
  }, [aboutProjectComplete, aboutYouComplete, currentStep, orgComplete, setStep, userId]);

  useEffect(() => {
    if (userId && !isOrgsLoading && !allOrgs?.length && !currentStep) {
      setStep(userId, OnboardingStep.ABOUT_YOU);
    }
  }, [allOrgs?.length, currentStep, isOrgsLoading, setStep, userId]);

  if (!userId || !currentStep) {
    return null;
  }

  if (isOrgsLoading) {
    return <MainLoader headerHeight={AUTH_MIN_APP_BAR_HEIGHT} />;
  }

  const Content = {
    [OnboardingStep.ABOUT_YOU]: <AboutYou />,
    [OnboardingStep.ABOUT_PROJECT]: <AboutProject />,
    [OnboardingStep.ORG_INFO]: <OrgInfo />,
    [OnboardingStep.PLAN_SELECT]: <PlanSelect />,
  };

  return (
    <FormProvider {...form}>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <MotionContainer
          key={currentStep}
          variants={ONBOARDING_MOTION_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={ONBOARDING_TRANSITION}
          custom={direction}
        >
          <Container key={currentStep}>{Content[currentStep]}</Container>
        </MotionContainer>
      </AnimatePresence>
    </FormProvider>
  );
};

const MotionContainer = styled(motion.div)`
  will-change: auto !important;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;
