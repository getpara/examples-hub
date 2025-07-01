import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { useGetAllOrganizations } from '../../hooks/api/queries/useOrganizations';
import { PlanSelect } from './components/PlanSelect';
import { useEffect } from 'react';
import { MainLoader } from '../../components/MainLoader';
import { AboutYou } from './components/AboutYou';
import { AboutProject } from './components/AboutProject';
import { AnimatePresence, motion } from 'framer-motion';
import { ONBOARDING_MOTION_VARIANTS, ONBOARDING_TRANSITION } from '../../layouts/onboarding/Layout';
import { useOnboardingForm } from './hooks/useOnboardingForm';
import { FormProvider } from 'react-hook-form';
import { aboutProjectQuestions, aboutYouQuestions } from './config/questionConfig';
import { useAccount } from '@getpara/react-sdk';
import { OnboardingAnswerOption } from '../../types/onboarding';

export const Onboarding = () => {
  const form = useOnboardingForm();
  const {
    embedded: { userId },
  } = useAccount();
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const setStep = useOnboardingStore(state => state.setStep);
  const direction = useOnboardingStore(state => state.direction);
  const { data: allOrgs, isLoading: isOrgsLoading } = useGetAllOrganizations();

  const aboutYouValues = form.watch(
    aboutYouQuestions.filter(q => ![OnboardingAnswerOption.HOMEPAGE_URL, OnboardingAnswerOption.TELEGRAM].includes(q)),
  ) as any[];
  const aboutYouComplete = aboutYouValues.every(v => !!v?.length);
  const aboutProjectValues = form.watch(aboutProjectQuestions) as any[];
  const aboutProjectComplete = aboutProjectValues.every(v => !!v?.length);

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!aboutYouComplete && currentStep !== OnboardingStep.ABOUT_YOU) {
      setStep(userId, OnboardingStep.ABOUT_YOU);
    }

    if (aboutYouComplete && !aboutProjectComplete && currentStep === OnboardingStep.PLAN_SELECT) {
      setStep(userId, OnboardingStep.ABOUT_PROJECT);
    }
  }, [aboutProjectComplete, aboutYouComplete, currentStep, setStep, userId]);

  useEffect(() => {
    if (userId && !isOrgsLoading && !allOrgs?.length && !currentStep) {
      setStep(userId, OnboardingStep.ABOUT_YOU);
    }
  }, [allOrgs?.length, currentStep, isOrgsLoading, setStep, userId]);

  if (!userId || !currentStep) {
    return null;
  }

  if (isOrgsLoading) {
    return <MainLoader />;
  }

  const Content = {
    [OnboardingStep.ABOUT_YOU]: <AboutYou />,
    [OnboardingStep.ABOUT_PROJECT]: <AboutProject />,
    [OnboardingStep.PLAN_SELECT]: <PlanSelect />,
  };

  return (
    <FormProvider {...form}>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          className="para:will-change-auto para:w-full"
          key={currentStep}
          variants={ONBOARDING_MOTION_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={ONBOARDING_TRANSITION}
          custom={direction}
        >
          <div className="para:flex para:flex-col para:items-center para:gap-4 para:w-full" key={currentStep}>
            {Content[currentStep]}
          </div>
        </motion.div>
      </AnimatePresence>
    </FormProvider>
  );
};
