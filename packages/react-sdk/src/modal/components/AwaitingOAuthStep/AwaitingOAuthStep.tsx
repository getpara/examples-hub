import { CpslSpinner } from '@usecapsule/react-components';
import {
  Heading,
  CreationStepSubheading,
  MainContainer,
  SpinnerContainer,
} from '../common';

export const AwaitingOAuthStep = () => {
  return (
    <>
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
      <MainContainer>
        <Heading>
          <span>Complete Login...</span>
        </Heading>
        <CreationStepSubheading>
          <span>Follow the prompts presented by your browser.</span>
        </CreationStepSubheading>
      </MainContainer>
    </>
  );
};
