import { CpslSpinner } from '@usecapsule/react-components';
import { Heading, CreationStepSubheading, MainContainer, SpinnerContainer } from '../common.js';
import { useModalStore } from '../../stores/index.js';

export const AwaitingBiometricsStep = () => {
  const isLogin = useModalStore((state) => state.isLogin());

  return (
    <>
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
      <MainContainer>
        <Heading>
          <span>{isLogin ? 'Waiting for Passkey...' : 'Creating Passkey...'}</span>
        </Heading>
        <CreationStepSubheading>
          <span>Follow the prompts presented by your browser.</span>
        </CreationStepSubheading>
      </MainContainer>
    </>
  );
};
