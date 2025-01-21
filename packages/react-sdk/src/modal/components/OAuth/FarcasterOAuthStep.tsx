import { useEffect, useState } from 'react';
import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { CenteredText, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useCapsuleStore, useModalStore, useThemeStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { AuthMethod, isMobile } from '@usecapsule/web-sdk';

const FarcasterOAuthStep = () => {
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
  const isIFrameReady = useModalStore(state => state.isIFrameReady);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);
  const theme = useThemeStore(state => state.theme);

  const [shouldRouteToStep, setShouldRouteToStep] = useState<ModalStep>();

  useEffect(() => {
    if (!!shouldRouteToStep && isIFrameReady) {
      // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
      setTimeout(() => {
        setStep(shouldRouteToStep);
      }, 200);
    }
  }, [shouldRouteToStep, isIFrameReady]);

  useEffect(() => {
    if (farcasterConnectUri) {
      const pollStatus = async () => {
        const { userExists, username, pfpUrl } = await capsule.waitForFarcasterStatus();

        setAuthInfo({ farcasterUsername: username, pfpUrl });

        setStep(ModalStep.AWAITING_OAUTH);

        if (userExists) {
          const supportedAuthMethods = await capsule.initiateUserLoginV2(username, 'farcaster');

          if (supportedAuthMethods.size > 0) {
            setSupportedAuthMethods(supportedAuthMethods);

            const biometricLocationHints = supportedAuthMethods.has(AuthMethod.PASSKEY)
              ? await capsule.getUserBiometricLocationHints()
              : [];

            setFlow('login');
            setStep(ModalStep.BIOMETRIC_LOGIN);
            setBiometricLocationHints(biometricLocationHints);
            return;
          }
        }

        const supportedCreateAuthMethods = await capsule.getSupportedCreateAuthMethods();

        setIsIFrameReady(false);
        setFlow('signUp');
        const supportsPasskey = supportedCreateAuthMethods.has(AuthMethod.PASSKEY);

        if (supportsPasskey) {
          setWebAuthURLForCreate(await capsule.shortenLoginLink(await capsule.getSetUpBiometricsURL(false, 'farcaster')));
          setStep(ModalStep.BIOMETRIC_CREATION);
        }
        if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD)) {
          setIFrameUrl(await capsule.shortenLoginLink(await capsule.getSetupPasswordURL(false, 'farcaster', theme)));
          setShouldRouteToStep(supportsPasskey ? ModalStep.BIOMETRIC_CREATION : ModalStep.PASSWORD_CREATION);
        }

        return;
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
