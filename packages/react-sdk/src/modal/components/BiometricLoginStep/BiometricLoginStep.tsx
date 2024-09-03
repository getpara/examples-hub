import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, QRContainer, StepContainer, InnerStepContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import styled from 'styled-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { isMobile } from '@usecapsule/web-sdk';

const SHORTENING_AVAILABLE = true;

export const BiometricLoginStep = () => {
  const [isCopied, copy] = useCopyToClipboard();

  const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const setLoginWindow = useModalStore(state => state.setLoginWindow);
  const capsule = useCapsuleStore(state => state.capsule);
  const username = useUserInfoStore(state => state.getUsername());

  const [shortLoginLink, setShortLoginLink] = useState<string>();
  const [shortHelpLink, setShortHelpLink] = useState<string>();

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
      const shortHelpUrl = await capsule.shortenLoginLink(`${webAuthURLForLogin}&skipAutoLogin=true`);
      setShortHelpLink(shortHelpUrl);
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

  const handleHelpClick = () => {
    openPopup(shortHelpLink, 'CapsulePasskey', 'LOGIN_PASSKEY');
    setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
  };

  const handleCopy = () => {
    copy(shortLoginLink);
  };

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Welcome back,
        </Heading>
        <IdentifierContainer>
          <IdentifierText variant="bodyS" weight="medium">
            {username}
          </IdentifierText>
        </IdentifierContainer>
      </InnerStepContainer>
      <MainContainer>
        <CpslButton fullWidth onClick={handlePasskeyClick}>
          <CpslIcon slot="start" icon="key" />
          Login with this device
        </CpslButton>
        <CpslDivider>or</CpslDivider>
        <InnerStepContainer>
          {!isMobile() && (
            <>
              <CpslText weight="semiBold">Scan with your mobile device</CpslText>
              <QRContainer>{!shortLoginLink ? <CpslSpinner size={100} /> : <CpslQrCode url={shortLoginLink} />}</QRContainer>
            </>
          )}
          <CpslButton size="small" variant="ghost" onClick={handleCopy}>
            <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
            {isCopied ? 'Copied' : 'Copy Link'}
          </CpslButton>
        </InnerStepContainer>
        <ClickableText variant="bodyXS" weight="medium" onClick={handleHelpClick}>
          I’m having trouble logging in
        </ClickableText>
      </MainContainer>
    </StepContainer>
  );
};

const IdentifierContainer = styled.div`
  padding: 8px 16px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-4);
`;

const MainContainer = styled(InnerStepContainer)`
  gap: 16px;
`;

const ClickableText = styled(CpslText)`
  text-decoration: underline;
  cursor: pointer;
`;

const IdentifierText = styled(CpslText)`
  color: var(--cpsl-color-background-96);
`;
