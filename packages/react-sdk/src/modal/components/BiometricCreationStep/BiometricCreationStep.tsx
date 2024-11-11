import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { InnerStepContainer, StepContainer, Heading, QRContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { useCopyToClipboard } from '@usecapsule/react-common';

const SHORTENING_AVAILABLE = true;

export const BiometricCreationStep = () => {
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const passwordUrlForCreate = useModalStore(state => state.passwordUrlForCreate);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const capsule = useCapsuleStore(state => state.capsule);
  const [shortLoginLink, setShortLoginLink] = useState<string>();

  const [isCopied, copy] = useCopyToClipboard();

  useEffect(() => {
    if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
      setShortLoginLink(null);
    }
    if (!webAuthURLForCreate) {
      return;
    }

    async function shortenUrl() {
      const shortUrl = await capsule.shortenLoginLink(webAuthURLForCreate);
      setShortLoginLink(shortUrl);
    }
    if (SHORTENING_AVAILABLE) {
      shortenUrl();
    } else {
      setShortLoginLink(webAuthURLForCreate);
    }
  }, [webAuthURLForCreate]);

  const handlePasskeyClick = () => {
    openPopup(shortLoginLink, 'CapsulePasskey', 'CREATE_PASSKEY');
    setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
  };

  const handlePasswordClick = () => {
    setStep(ModalStep.PASSWORD_CREATION);
  };

  const handleCopy = () => {
    copy(shortLoginLink);
  };

  return (
    <>
      {webAuthURLForCreate && passwordUrlForCreate === undefined && (
        <PasskeyOnly
          handlePasskeyClick={handlePasskeyClick}
          shortLoginLink={shortLoginLink}
          handleCopy={handleCopy}
          isCopied={isCopied}
        />
      )}
      {webAuthURLForCreate && passwordUrlForCreate && (
        <PasswordAndPasskey
          handlePasskeyClick={handlePasskeyClick}
          handlePasswordClick={handlePasswordClick}
          shortLoginLink={shortLoginLink}
          handleCopy={handleCopy}
          isCopied={isCopied}
        />
      )}
    </>
  );
};

const PasskeyOnly = ({ handlePasskeyClick, shortLoginLink, handleCopy, isCopied }) => {
  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Create Passkey
        </Heading>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          Your Passkey keeps your account safe.
        </CpslText>
      </InnerStepContainer>

      <InnerStepContainer>
        {isPasskeySupported() ? (
          <CpslButton fullWidth onClick={handlePasskeyClick}>
            Create
          </CpslButton>
        ) : (
          <>
            <CpslText weight="semiBold">Scan with your mobile device</CpslText>
            <QRContainer>{!shortLoginLink ? <CpslSpinner size={100} /> : <CpslQrCode url={shortLoginLink} />}</QRContainer>
            <CpslButton size="small" variant="ghost" onClick={handleCopy}>
              <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
              {isCopied ? 'Copied' : 'Copy Link'}
            </CpslButton>
          </>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};

const PasswordAndPasskey = ({ handlePasskeyClick, handlePasswordClick, shortLoginLink, handleCopy, isCopied }) => {
  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Secure Your Account
        </Heading>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          Choose a password or set up a passkey
        </CpslText>
      </InnerStepContainer>

      <InnerStepContainer>
        {isPasskeySupported() ? (
          <CpslButton fullWidth onClick={handlePasskeyClick}>
            <CpslIcon slot="start" icon="key" />
            Create Passkey
          </CpslButton>
        ) : (
          <>
            <CpslText weight="semiBold">Scan with your mobile device</CpslText>
            <QRContainer>{!shortLoginLink ? <CpslSpinner size={100} /> : <CpslQrCode url={shortLoginLink} />}</QRContainer>
            <CpslButton size="small" variant="ghost" onClick={handleCopy}>
              <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
              {isCopied ? 'Copied' : 'Copy Link'}
            </CpslButton>
          </>
        )}

        <CpslDivider>or</CpslDivider>

        <CpslButton fullWidth onClick={handlePasswordClick}>
          <CpslIcon slot="start" icon="passcode" />
          Choose Password
        </CpslButton>
      </InnerStepContainer>
    </StepContainer>
  );
};
