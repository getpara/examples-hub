import { useForm } from 'react-hook-form';
import { OnboardingAnswers } from '../../../types/onboarding';
import { capsule } from '../../../clients/capsule';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';

export const useOnboardingForm = () => {
  const userId = capsule.getUserId();
  const defaultValues = useOnboardingStore(state => state.getInput(userId));

  const form = useForm<OnboardingAnswers>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  return form;
};
