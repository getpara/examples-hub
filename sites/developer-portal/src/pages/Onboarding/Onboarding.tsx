import styled from 'styled-components';
import { capsule } from '../../clients/capsule';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { Form } from './components/Form';
import { OrgName } from './components/OrgName';
import { useGetAllOrganizations } from '../../hooks/api/queries/useOrganizations';
import { PlanSelect } from './components/PlanSelect';
import { useState } from 'react';

export const Onboarding = () => {
  const userId = capsule.getUserId();
  const currentStep = useOnboardingStore(state => state.getStep(userId));
  const setStep = useOnboardingStore(state => state.setStep);
  const { data: allOrganizations } = useGetAllOrganizations();

  const [orgName, setOrgName] = useState('');

  if (!userId) {
    return null;
  }

  // If no step is set, start at the form
  if (!currentStep) {
    setStep(userId, OnboardingStep.FORM);
    return null;
  }

  // If the user doesn't have an org yet but is on the plan step, with no org name set back down to collect the org name again
  if (!allOrganizations?.length && !orgName && currentStep === OnboardingStep.PLAN_SELECT) {
    setStep(userId, OnboardingStep.ORG_NAME);
    return null;
  }

  const Content = {
    [OnboardingStep.FORM]: <Form />,
    [OnboardingStep.ORG_NAME]: <OrgName orgName={orgName} setOrgName={setOrgName} />,
    [OnboardingStep.PLAN_SELECT]: <PlanSelect orgName={orgName} />,
  };

  return <Container>{Content[currentStep]}</Container>;
};

const Container = styled.div`
  width: 100%;
`;
