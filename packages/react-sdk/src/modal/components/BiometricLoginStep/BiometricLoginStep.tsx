import {
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslQrCode,
  CpslSpinner,
} from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores';
import { ModalStep } from '../../utils/steps';
import {
  Heading,
  SecondaryText,
  MainContainer,
  QRContainer,
  ButtonWithIconContainer,
} from '../common';
import { openPopup } from '../../utils/openPopup';

const SHORTENING_AVAILABLE = true;

export const BiometricLoginStep = () => {
  const webAuthURLForLogin = useModalStore((state) => state.webAuthURLForLogin);
  const currentStep = useModalStore((state) => state.step);
  const setStep = useModalStore((state) => state.setStep);
  const capsule = useCapsuleStore((state) => state.capsule);

  const [shortLoginLink, setShortLoginLink] = useState<string>();

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
    openPopup(shortLoginLink, 'CapsulePasskey');
    setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
  };

  return (
    <>
      <MainContainer>
        <Heading>
          <span>Login With Passkey</span>
        </Heading>
        <SecondaryText>
          <span>
            If the Passkey you registered previously lives on this device, click
            Login With Passkey.{'\n\n'}Otherwise, scan the QR code below with
            another device that has your Passkey.
          </span>
        </SecondaryText>
      </MainContainer>
      <CpslButton onClick={handlePasskeyClick}>
        <ButtonWithIconContainer>
          Login With Passkey On This Device
          <CpslIcon icon="key" />
        </ButtonWithIconContainer>
      </CpslButton>
      <CpslDivider>or</CpslDivider>
      <QRContainer>
        {!shortLoginLink ? (
          <CpslSpinner />
        ) : (
          <CpslQrCode url={shortLoginLink} />
        )}
      </QRContainer>
      <SecondaryText>
        <span>Scan with your phone’s camera</span>
      </SecondaryText>
    </>
  );
};
