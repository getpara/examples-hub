import { Widget } from '@typeform/embed-react';
import { capsule } from '../../../clients/capsule';
import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';

export const Form = () => {
  const userId = capsule.getUserId();
  const setStep = useOnboardingStore(state => state.setStep);

  const handleSubmit = () => {
    // Safe non null assertion here since userId is checked for in the parent component
    setStep(userId!, OnboardingStep.ORG_NAME);
  };

  return (
    <Widget
      //   id="https://7f4shq8oyfd.typeform.com/to/VtuKQEAh"
      id="https://7f4shq8oyfd.typeform.com/to/E7mshFC1"
      style={{ width: '100%', height: '100%' }}
      onSubmit={handleSubmit}
    />
  );
};
