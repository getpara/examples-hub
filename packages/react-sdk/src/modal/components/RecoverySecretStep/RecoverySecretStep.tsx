import { CpslSlideButton, CpslTileButton } from '@usecapsule/react-components';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores';
import { ModalStep } from '../../utils/steps';
import { Heading, MainContainer, SecondaryText } from '../common';
import styled from 'styled-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { getMailtoLink } from '../../utils/getMailtoLink';
import { useState } from 'react';
interface RecoverySecretStepProps {
  recoveryShare: string;
}

export const RecoverySecretStep = ({
  recoveryShare,
}: RecoverySecretStepProps) => {
  const setStep = useModalStore((state) => state.setStep);
  const email = useUserInfoStore((state) => state.email);
  const [copied, copy] = useCopyToClipboard();
  const [hasSavedSecret, setHasSavedSecret] = useState(false);

  const handleCopy = () => {
    copy(backupDecryptionKey);
    setHasSavedSecret(true);
  };

  const backupDecryptionKey = JSON.parse(
    recoveryShare || '{}',
  ).backupDecryptionKey;

  const handleNext = async () => {
    setStep(ModalStep.WALLET_CREATION_DONE);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([backupDecryptionKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    setHasSavedSecret(true);
  };

  const handleEmail = () => {
    window.open(getMailtoLink(email, backupDecryptionKey), '_self');
    setHasSavedSecret(true);
  };

  return (
    <>
      <StyledMainContainer>
        <Heading>Your Recovery Secret</Heading>
        <SecondaryText>
          Your Recovery Secret allows you to set up a new Passkey in the event
          you lose access to your current one.
        </SecondaryText>
      </StyledMainContainer>
      <ButtonContainer>
        <StyledCpslTileButton
          icon={copied ? 'check' : 'copy'}
          onClick={handleCopy}
        >
          <TileButtonText>{copied ? 'COPIED!' : 'COPY'}</TileButtonText>
        </StyledCpslTileButton>
        <StyledCpslTileButton icon="downloadCloud" onClick={handleDownload}>
          <TileButtonText>DOWNLOAD</TileButtonText>
        </StyledCpslTileButton>
        <StyledCpslTileButton icon="mail" onClick={handleEmail}>
          <TileButtonText>EMAIL</TileButtonText>
        </StyledCpslTileButton>
      </ButtonContainer>
      <CpslSlideButton
        startIcon="arrow"
        endIcon="check"
        startText={
          !hasSavedSecret
            ? 'First, save your recovery secret.'
            : 'I’ve Saved My Recovery Secret'
        }
        endText="OK! Great Job!"
        onCpslComplete={handleNext}
        disabled={!hasSavedSecret}
      />
      <SliderHelper>
        {!hasSavedSecret ? 'Choose an option above.' : 'Slide to complete'}
      </SliderHelper>
    </>
  );
};

const StyledMainContainer = styled(MainContainer)`
  margin-top: 4px;
  padding-top: 16px;
  margin-bottom: 0px;
`;

const StyledCpslTileButton = styled(CpslTileButton)`
  --button-icon-color: var(--cpsl-color-text-secondary);
`;

const TileButtonText = styled(SecondaryText)`
  font-size: 8px;
  line-height: 100%;
  font-weight: 500;
  letter-spacing: 1px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const SliderHelper = styled(SecondaryText)`
  margin-top: -8px;
`;
