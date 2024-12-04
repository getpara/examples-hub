import { useEffect } from 'react';
import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { CenteredText, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { AuthMethod, isMobile } from '@usecapsule/web-sdk';

const FarcasterOAuthStep = () => {
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setPasswordUrlForCreate = useModalStore(state => state.setPasswordUrlForCreate);
  const setIdentifier = useUserInfoStore(state => state.setIdentifier);
  const setIdentifierType = useUserInfoStore(state => state.setIdentifierType);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);

  useEffect(() => {
    if (farcasterConnectUri) {
      const pollStatus = async () => {
        const { userExists, username } = await capsule.waitForFarcasterStatus();

        setStep(ModalStep.AWAITING_OAUTH);

        setIdentifier(username);
        setIdentifierType('farcaster');

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

        if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD)) {
          setPasswordUrlForCreate(await capsule.getSetupPasswordURL(false, 'farcaster'));
        }

        if (supportedCreateAuthMethods.has(AuthMethod.PASSKEY)) {
          setWebAuthURLForCreate(await capsule.getSetUpBiometricsURL(false, 'farcaster'));
        }

        setFlow('signUp');
        setStep(ModalStep.BIOMETRIC_CREATION);
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
