import { CpslSpinner, CpslText } from '@getpara/react-components';
import { Heading, SpinnerContainer, StepContainer, InnerStepContainer } from '../common.js';

interface WaitingProps {
  heading: string;
  subheading: string;
}

export const Waiting = ({ heading, subheading }: WaitingProps) => {
  return (
    <StepContainer $wide>
      <SpinnerContainer>
        <CpslSpinner size={100} />
      </SpinnerContainer>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          {heading}
        </Heading>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          {subheading}
        </CpslText>
      </InnerStepContainer>
    </StepContainer>
  );
};
