import { Widget } from '@typeform/embed-react';
import { capsule } from '../../../clients/capsule';
import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useEffect } from 'react';
import { ENV_VARS } from '../../../utils/constants';

export const Form = () => {
  const userId = capsule.getUserId();
  const setStep = useOnboardingStore(state => state.setStep);

  const shouldSkipForm = ENV_VARS.environment === 'DEV' || ENV_VARS.environment === 'SANDBOX';

  // Skip the form on local & sandbox
  useEffect(() => {
    if (shouldSkipForm) {
      setStep(userId!, OnboardingStep.ORG_NAME);
    }
  }, [setStep, shouldSkipForm, userId]);

  const handleSubmit = () => {
    // Safe non null assertion here since userId is checked for in the parent component
    setStep(userId!, OnboardingStep.ORG_NAME);
  };

  if (shouldSkipForm) {
    return null;
  }

  return (
    <Widget
      id="https://7f4shq8oyfd.typeform.com/to/VtuKQEAh"
      style={{ width: '100%', height: '100%' }}
      onSubmit={handleSubmit}
    />
  );
};
