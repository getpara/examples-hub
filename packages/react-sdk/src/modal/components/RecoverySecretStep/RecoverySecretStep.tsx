import { CpslSlideButton, CpslTileButton } from '@usecapsule/react-components';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, MainContainer, SecondaryText } from '../common.js';
import { styled } from 'styled-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { getMailtoLink } from '../../utils/getMailtoLink.js';
import { useState } from 'react';
interface RecoverySecretStepProps {
  recoveryShare: string;
}

export const SaveRecoverySecret = ({
  email,
  value,
  onComplete,
}: {
  email: string;
  value: string;
  onComplete: () => void;
}) => {
  const [isSecretSaved, setIsSecretSaved] = useState(false);
  const [isCopied, copy] = useCopyToClipboard();

  const onCopy = () => {
    copy(value);
    setIsSecretSaved(true);
  };

  const onDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([value], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    setIsSecretSaved(true);
  };

  const onEmail = () => {
    window.open(getMailtoLink(email, value), '_self');
    setIsSecretSaved(true);
  };

  return (
    <>
      <ButtonContainer>
        <StyledCpslTileButton icon={isCopied ? 'check' : 'copy'} onClick={onCopy}>
          <TileButtonText>{isCopied ? 'Copied!' : 'Copy'}</TileButtonText>
        </StyledCpslTileButton>
        <StyledCpslTileButton icon="downloadCloud" onClick={onDownload}>
          <TileButtonText>Download</TileButtonText>
        </StyledCpslTileButton>
        <StyledCpslTileButton icon="mail" onClick={onEmail}>
          <TileButtonText>Email</TileButtonText>
        </StyledCpslTileButton>
      </ButtonContainer>
      <CpslSlideButton
        startIcon="arrow"
        endIcon="check"
        startText={!isSecretSaved ? 'First, save your recovery secret.' : 'I’ve Saved My Recovery Secret'}
        endText="OK! Great Job!"
        onCpslComplete={onComplete}
        disabled={!isSecretSaved}
      />
      <SliderHelper>{!isSecretSaved ? 'Choose an option above.' : 'Slide to complete'}</SliderHelper>
    </>
  );
};

export const RecoverySecretStep = ({ recoveryShare }: RecoverySecretStepProps) => {
  const setStep = useModalStore(state => state.setStep);
  const email = useUserInfoStore(state => state.email);

  const backupDecryptionKey = JSON.parse(recoveryShare || '{}').backupDecryptionKey;

  const onComplete = async () => {
    setStep(ModalStep.WALLET_CREATION_DONE);
  };

  return (
    <>
      <StyledMainContainer>
        <Heading>Your Recovery Secret</Heading>
        <SecondaryText>
          Your Recovery Secret allows you to set up a new Passkey in the event you lose access to your current one.
        </SecondaryText>
      </StyledMainContainer>
      <SaveRecoverySecret email={email} value={backupDecryptionKey} onComplete={onComplete} />
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
  text-transform: uppercase;
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
