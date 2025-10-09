import { CpslSpinner, CpslText } from '@getpara/react-components';
import { Heading, SpinnerContainer, StepContainer, InnerStepContainer } from '../common.js';
import { safeStyled } from '@getpara/react-common';

interface WaitingProps {
  heading?: string;
  subheading?: string;
}

export const Waiting = ({ heading, subheading }: WaitingProps) => {
  return (
    <Container $wide>
      <SpinnerContainer>
        <CpslSpinner size={100} />
      </SpinnerContainer>
      {heading && (
        <InnerStepContainer>
          <Heading>{heading}</Heading>
          {subheading && (
            <CpslText variant="bodyS" color="secondary" weight="medium">
              {subheading}
            </CpslText>
          )}
        </InnerStepContainer>
      )}
    </Container>
  );
};

const Container = safeStyled(StepContainer)`
  flex: 1;
  justify-content: space-between;
`;
