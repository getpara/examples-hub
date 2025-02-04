import { styled } from 'styled-components';
import { para } from '../../../clients/para';
import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CpslButton, CpslIcon } from '@getpara/react-components';
import { useLogout } from '../../../hooks/useLogout';
import { useFormContext, useFormState } from 'react-hook-form';
import { OnboardingAnswerOption, OnboardingAnswers } from '../../../types/onboarding';
import { useSubmitOnboarding } from '../hooks/useSubmitOnboarding';
import { PlanSlug } from '../../../utils/constants';

interface ControlsProps {
  questions: OnboardingAnswerOption[];
}

export const Controls = ({ questions }: ControlsProps) => {
  const { watch } = useFormContext<OnboardingAnswers>();
  const userId = para.getUserId();
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const setStep = useOnboardingStore(state => state.setStep);
  const setDirection = useOnboardingStore(state => state.setDirection);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { isValid } = useFormState();
  const { submitOnboarding, isLoading } = useSubmitOnboarding();

  const formValues = watch(questions) as any[];
  const canGoNext = formValues?.every(v => !!v?.length) && isValid;

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
    <Container>
      <StyledButton variant="secondary" onClick={handlePrevClick} disabled={isLoading}>
        <FlippedIcon icon="arrowNarrow" slot="start" />
        {previousText}
      </StyledButton>
      <StyledButton onClick={handleNextClick} disabled={!canGoNext || isLoading}>
        {nextText}
        <CpslIcon icon="arrowNarrow" slot="end" />
      </StyledButton>
      {isLastStep && (
        <FullRowButton variant="secondary" onClick={handlePlansClick} fullWidth disabled={isLoading}>
          View Plans
        </FullRowButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const FlippedIcon = styled(CpslIcon)`
  transform: rotate(180deg);
`;

const FullRowButton = styled(CpslButton)`
  flex-basis: 100%;
`;

const StyledButton = styled(CpslButton)`
  &::part(button-native) {
    min-width: 100px;
  }
`;
