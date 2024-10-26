import { CpslButton, CpslDivider, CpslIcon } from '@usecapsule/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import styled from 'styled-components';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { formatBiometricHints, KnownDevices, UserIdentifier } from '@usecapsule/react-common';

const SHORTENING_AVAILABLE = true;

export const BiometricLoginStep = () => {
  const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const setLoginWindow = useModalStore(state => state.setLoginWindow);
  const biometricLocationHints = useModalStore(state => state.biometricLocationHints);
  const capsule = useCapsuleStore(state => state.capsule);
  const username = useUserInfoStore(state => state.getUsername());

  const [shortLoginLink, setShortLoginLink] = useState<string>();

  const passkeysSupported = isPasskeySupported();
  const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints), [biometricLocationHints]);

  useEffect(() => {
    if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
      setShortLoginLink(null);
    }
    if (!webAuthURLForLogin) {
      return;
    }

    async function shortenUrl() {
      const shortUrl = await capsule.shortenLoginLink(webAuthURLForLogin);
      setShortLoginLink(shortUrl);
    }
    if (SHORTENING_AVAILABLE) {
      shortenUrl();
    } else {
      setShortLoginLink(webAuthURLForLogin);
    }
  }, [webAuthURLForLogin]);

  const handlePasskeyClick = () => {
    const loginWindow = openPopup(shortLoginLink, 'CapsulePasskey', 'LOGIN_PASSKEY');

    setLoginWindow(loginWindow);
    setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
  };

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        {passkeysSupported && formattedHints.isOnKnownDevice && (
          <Heading variant="headingS" weight="bold">
            Welcome back,
          </Heading>
        )}
        <UserIdentifier identifier={username} />
      </InnerStepContainer>
      <MainContainer>
        {!formattedHints.isOnKnownDevice && <KnownDevices hints={formattedHints} link={shortLoginLink} />}
        {passkeysSupported && (
          <>
            {!formattedHints.isOnKnownDevice && <CpslDivider>or</CpslDivider>}
            <CpslButton fullWidth onClick={handlePasskeyClick}>
              {formattedHints.isOnKnownDevice ? (
                <>
                  <CpslIcon slot="start" icon="key" />
                  Login with passkey
                </>
              ) : (
                'Continue anyway'
              )}
            </CpslButton>
          </>
        )}
      </MainContainer>
    </StepContainer>
  );
};

const MainContainer = styled(InnerStepContainer)`
  gap: 16px;
`;
