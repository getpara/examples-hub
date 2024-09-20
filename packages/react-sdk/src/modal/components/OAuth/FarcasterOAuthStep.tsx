import { useEffect } from 'react';
import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { CenteredText, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { isMobile } from '@usecapsule/web-sdk';

const FarcasterOAuthStep = () => {
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);

  useEffect(() => {
    if (farcasterConnectUri) {
      const pollStatus = async () => {
        const { userExists, username } = await capsule.waitForFarcasterStatus();

        setStep(ModalStep.AWAITING_OAUTH);
        if (userExists) {
          const webAuthUrlForLogin = await capsule.initiateUserLogin(username, false, 'farcaster');
          setFlow('login');
          setWebAuthURLForLogin(webAuthUrlForLogin);
          setStep(ModalStep.BIOMETRIC_LOGIN);
        } else {
          const webAuthURLForCreate = await capsule.getSetUpBiometricsURL(false, 'farcaster');
          setFlow('signUp');
          setWebAuthURLForCreate(webAuthURLForCreate);
          setStep(ModalStep.BIOMETRIC_CREATION);
        }
      };

      pollStatus();

      return () => {
        setFarcasterConnectUri(undefined);
      };
    }
  }, [farcasterConnectUri]);

  return (
    <StepContainer $wide>
      {isMobile() ? (
        <InnerStepContainer>
          <CpslText weight="medium" color="secondary">
            {`Don’t have Farcaster`}
          </CpslText>
          <CpslButton as="a" href={'https://link.warpcast.com/download-qr'} target="_blank" variant="secondary">
            <CpslIcon slot="start" icon="linkExternal" />
            {`Get Farcaster`}
          </CpslButton>
        </InnerStepContainer>
      ) : (
        <>
          <Heading variant="headingS" weight="bold">
            Sign in using Farcaster
          </Heading>
          <InnerStepContainer>
            <CenteredText variant="bodyS" color="secondary" weight="medium">
              Scan the QR code with your phone's camera to proceed.
            </CenteredText>
            <QRContainer>
              {!farcasterConnectUri ? <CpslSpinner size={100} /> : <CpslQrCode url={farcasterConnectUri} />}
            </QRContainer>
          </InnerStepContainer>
        </>
      )}
    </StepContainer>
  );
};

export default FarcasterOAuthStep;
