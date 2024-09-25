import { CpslText } from '@usecapsule/react-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import { useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../hooks/api/queries/useApiKeySetupStatus';
import styled from 'styled-components';

const STEPS = ['Next: Install Package', 'Next: Run Package', 'Next: Create User', 'You are ready to go!'];

export const ProjectStatusCard = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');

  let stepNumber = 0;

  if (status) {
    if (status.firstUser) {
      stepNumber = 3;
    } else if (status.isUsed) {
      stepNumber = 2;
    } else if (status.isInstalled) {
      stepNumber = 1;
    }
  }

  const step = STEPS[stepNumber];

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            Project Status
          </CpslText>
        </SplitCardInnerContainer>
      }
      RightContent={
        <RightContainer>
          <StepText variant="bodyL" weight="semiBold" $isComplete={stepNumber === STEPS.length - 1}>
            {stepNumber}/{STEPS.length - 1} Steps Completed
          </StepText>
          <CpslText weight="medium" color="tertiary">
            {step}
          </CpslText>
        </RightContainer>
      }
    />
  );
};

const StepText = styled(CpslText)<{ $isComplete?: boolean }>`
  color: ${({ $isComplete }) => ($isComplete ? 'var(--cpsl-color-utility-green)' : 'var(--cpsl-color-utility-yellow)')};
`;

const RightContainer = styled(SplitCardInnerContainer)`
  align-items: flex-end;
`;
