import { capsule } from '../../../clients/capsule';
import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import styled from 'styled-components';
import { CpslButton, CpslIcon, CpslInput } from '@usecapsule/react-components';
import { CpslInputCustomEvent, InputInputEventDetail } from '@usecapsule/core-components';
import { CenteredText } from '../../../components/common';

interface OrgNameProps {
  orgName: string;
  setOrgName: (_: string) => void;
}

export const OrgName = ({ orgName, setOrgName }: OrgNameProps) => {
  const userId = capsule.getUserId();
  const setStep = useOnboardingStore(state => state.setStep);

  const handleNameChange = (event: CpslInputCustomEvent<InputInputEventDetail>) => {
    setOrgName(event.detail.value ?? '');
  };

  const handleNextClick = () => {
    setStep(userId!, OnboardingStep.PLAN_SELECT);
  };

  return (
    <OuterContainer>
      <InnerContainer>
        <CenteredText variant="headingS" weight="semiBold">
          Almost There!
        </CenteredText>
        <InputContainer>
          <CpslInput
            label="Name your Capsule organization"
            placeholder="Enter name"
            value={orgName}
            onCpslInput={handleNameChange}
          />
          <CpslButton onClick={handleNextClick} fullWidth disabled={!orgName}>
            Next
            <CpslIcon slot="end" icon="arrowNarrow" />
          </CpslButton>
        </InputContainer>
      </InnerContainer>
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: center;
  margin-top: 77px;
  width: 325px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
