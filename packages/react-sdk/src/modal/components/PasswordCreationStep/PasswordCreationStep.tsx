import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import styled from 'styled-components';
import { SpinnerContainer } from '@usecapsule/react-common';
import { CpslSpinner } from '@usecapsule/react-components';

export const PasswordCreationStep = () => {
  const passwordAuthURLForCreate = useModalStore(state => state.passwordUrlForCreate);
  const currentStep = useModalStore(state => state.step);
  const capsule = useCapsuleStore(state => state.capsule);
  const [shortLoginLink, setShortLoginLink] = useState<string>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
      setShortLoginLink(null);
    }
    if (!passwordAuthURLForCreate) {
      return;
    }

    async function shortenUrl() {
      const shortUrl = await capsule.shortenLoginLink(passwordAuthURLForCreate);
      setShortLoginLink(shortUrl);
    }

    shortenUrl();
  }, [passwordAuthURLForCreate]);

  return (
    <OuterContainer>
      <Container isReady={isReady}>
        <iframe
          src={shortLoginLink}
          onLoad={() => {
            setIsReady(true);
          }}
        />
      </Container>
      {!isReady && (
        <SpinnerContainer style={{ width: '100%', height: '100%', flex: 1 }}>
          <CpslSpinner size={100} />
        </SpinnerContainer>
      )}
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div<{ isReady: boolean }>`
  height: 100%;
  width: 100%;
  display: ${({ isReady }) => (isReady ? 'block' : 'none')};

  & > iframe {
    height: 360px;
    width: 100%;
  }
`;
