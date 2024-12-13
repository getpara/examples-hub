import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { InnerStepContainer, StepContainer, Heading, QRContainer } from '../common.js';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { useCopyToClipboard, UserIdentifier } from '@usecapsule/react-common';

const SHORTENING_AVAILABLE = true;

export const BiometricCreationStep = ({
  handlePasswordClick,
  handlePasskeyClick,
}: {
  handlePasswordClick: () => Promise<void>;
  handlePasskeyClick: () => Promise<void>;
}) => {
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const passwordUrlForCreate = useModalStore(state => state.passwordUrlForCreate);
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const currentStep = useModalStore(state => state.step);
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

  const handleCopy = () => {
    copy(shortLoginLink);
  };

  const isBoth = !!webAuthURLForCreate && !!passwordUrlForCreate;

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          {isBoth ? 'Secure Your Account' : 'Create Passkey'}
        </Heading>
        <UserIdentifier {...authInfo} />
        <CpslText variant="bodyS" color="secondary" weight="medium">
          {isBoth ? 'Choose a password or set up a passkey' : 'Your Passkey keeps your account safe.'}
        </CpslText>
      </InnerStepContainer>

      <InnerStepContainer>
        {isPasskeySupported() ? (
          <CpslButton fullWidth onClick={handlePasskeyClick}>
            <CpslIcon slot="start" icon="key" />
            {isBoth ? 'Create Passkey' : 'Create'}
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

        {isBoth && (
          <>
            <CpslDivider>or</CpslDivider>

            <CpslButton fullWidth onClick={handlePasswordClick}>
              <CpslIcon slot="start" icon="passcode" />
              Choose Password
            </CpslButton>
          </>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};
