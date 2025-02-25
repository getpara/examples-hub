import { useForm } from 'react-hook-form';
import { OnboardingAnswers } from '../../../types/onboarding';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useAccount } from '@getpara/react-sdk';

export const useOnboardingForm = () => {
  const { data: account } = useAccount();
  const userId = account?.userId;
  const defaultValues = useOnboardingStore(state => state.getInput(userId));

  const form = useForm<OnboardingAnswers>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  return form;
};
