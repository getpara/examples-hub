import React, { useState, useEffect } from 'react';
import { CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { QRContainer } from '../common.js';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 20px;
`;

const FarcasterOAuthStep = () => {
  const [connectUri, setConnectUri] = useState('');
  const setStep = useModalStore((state) => state.setStep);
  const setWebAuthURLForCreate = useModalStore((state) => state.setWebAuthURLForCreate);
  const setWebAuthURLForLogin = useModalStore((state) => state.setWebAuthURLForLogin);
  const capsule = useCapsuleStore((state) => state.capsule);
  const setFlow = useModalStore((state) => state.setFlow);

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
    <CenteredContainer>
      <CpslText variant="bodyL" weight="bold">
        Sign in using Farcaster
      </CpslText>
      <CpslText>Scan the QR code with your phone's camera to proceed.</CpslText>
      <QRContainer>{!connectUri ? <CpslSpinner /> : <CpslQrCode url={connectUri} />}</QRContainer>
    </CenteredContainer>
  );
};

export default FarcasterOAuthStep;
