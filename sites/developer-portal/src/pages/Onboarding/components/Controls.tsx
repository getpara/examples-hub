import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogout } from '../../../hooks/useLogout';
import { useFormState } from 'react-hook-form';
import { useSubmitOnboarding } from '../hooks/useSubmitOnboarding';
import { PlanSlug } from '../../../utils/constants';
import { useAccount } from '@getpara/react-sdk';
import { Button } from '@getpara/react-component-library';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const Controls = () => {
  const {
    embedded: { userId },
  } = useAccount();
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const setStep = useOnboardingStore(state => state.setStep);
  const setDirection = useOnboardingStore(state => state.setDirection);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { isValid } = useFormState();
  const { submitOnboarding, isLoading } = useSubmitOnboarding();

  const canGoNext = isValid;

  const hasInvite = searchParams.get('invite');
  // Excluding the plan select step here since that step doesn't contain controls
  const totalStepsExcludingPlan = Object.values(OnboardingStep).length - 1;
  const currentStepIndex = Object.keys(OnboardingStep).indexOf(currentStep ?? '');
  const currentStepNumber = (currentStepIndex === -1 ? 0 : currentStepIndex) + 1;

  const isLastStep = currentStepNumber === totalStepsExcludingPlan;
  const nextText = isLastStep ? 'Get Started For Free' : 'Next';
  const previousText = currentStepNumber === 1 && !hasInvite ? 'Logout' : 'Back';

  const handleNextClick = async () => {
    if (!userId) {
      return;
    }

    if (!isLastStep) {
      const nextStep = Object.values(OnboardingStep)[currentStepIndex + 1];
      setDirection(1);
      setStep(userId, nextStep);
    } else {
      await submitOnboarding(PlanSlug.FREE);
    }
  };

  const handlePrevClick = async () => {
    if (!userId) {
      return;
    }

    if (currentStepIndex === 0) {
      if (!hasInvite) {
        await logout();
      } else {
        navigate({ pathname: '/onboarding/invite', search: searchParams.toString() });
      }
    } else {
      const prevStep = Object.values(OnboardingStep)[currentStepIndex - 1];
      setDirection(-1);
      setStep(userId, prevStep);
    }
  };

  const handlePlansClick = () => {
    if (!userId) {
      return;
    }

    setStep(userId, OnboardingStep.PLAN_SELECT);
  };

  return (
    <div className="para:flex para:justify-between para:flex-wrap para:gap-2">
      <Button className="para:h-10" variant="outline" size="lg" onClick={handlePrevClick} disabled={isLoading}>
        <ArrowLeft className="para:size-4 para:stroke-foreground" />
        {previousText}
      </Button>
      <Button
        className="para:h-10 para:flex-1"
        size="lg"
        variant="neutral"
        onClick={handleNextClick}
        disabled={!canGoNext || isLoading}
      >
        {nextText}
        <ArrowRight className="para:size-4" />
      </Button>
      {isLastStep && (
        <Button
          className="para:h-10 para:flex-1"
          variant="outline"
          size="lg"
          onClick={handlePlansClick}
          disabled={isLoading}
        >
          View Plans
        </Button>
      )}
    </div>
  );
};
