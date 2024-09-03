import { useState, useEffect } from 'react';
import { CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';

const FarcasterOAuthStep = () => {
  const [connectUri, setConnectUri] = useState('');
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);

  useEffect(() => {
    const initializeFarcaster = async () => {
      const connectUri = await capsule.getFarcasterConnectURL();
      setConnectUri(connectUri);
    };

    initializeFarcaster();
  }, []);

  useEffect(() => {
    if (connectUri) {
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
        setConnectUri('');
      };
    }
  }, [connectUri]);

  return (
    <StepContainer $wide>
      <Heading variant="headingS" weight="bold">
        Sign in using Farcaster
      </Heading>
      <InnerStepContainer>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          Scan the QR code with your phone's camera to proceed.
        </CpslText>
        <QRContainer>{!connectUri ? <CpslSpinner size={100} /> : <CpslQrCode url={connectUri} />}</QRContainer>
      </InnerStepContainer>
    </StepContainer>
  );
};

export default FarcasterOAuthStep;
