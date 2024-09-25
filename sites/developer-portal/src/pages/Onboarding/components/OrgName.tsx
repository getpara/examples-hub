import { capsule } from '../../../clients/capsule';
import { OnboardingStep, useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import styled from 'styled-components';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@usecapsule/react-components';
import { CpslInputCustomEvent, InputInputEventDetail } from '@usecapsule/core-components';

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

  const handleSubmit = () => {
    // Safe non null assertion here since userId is checked for in the parent component
    setStep(userId!, OnboardingStep.REQUEST_ACCESS);
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
          <CpslButton onClick={handleSubmit} fullWidth>
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

const CenteredText = styled(CpslText)`
  text-align: center;
`;
