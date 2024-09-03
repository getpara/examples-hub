import { CpslButton, CpslText } from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { InnerStepContainer, StepContainer, Heading } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';

const SHORTENING_AVAILABLE = true;

export const BiometricCreationStep = () => {
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const currentStep = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const capsule = useCapsuleStore(state => state.capsule);
  const [shortLoginLink, setShortLoginLink] = useState<string>();

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
      <CpslButton fullWidth onClick={handlePasskeyClick}>
        Create
      </CpslButton>
    </StepContainer>
  );
};
