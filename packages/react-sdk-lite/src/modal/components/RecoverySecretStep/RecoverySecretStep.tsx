import { CpslButton, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, InnerStepContainer, StepContainer, StyledCpslTileButton } from '../common.js';
import { safeStyled } from '@getpara/react-common';
import { useCopyToClipboard } from '@getpara/react-common';
import { getMailtoLink } from '../../utils/getMailtoLink.js';
import { useState } from 'react';
import { useStore } from '../../../provider/stores/useStore.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

export const SaveRecoverySecret = ({
  email,
  value,
  onComplete,
}: {
  email?: string;
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
    typeof window !== 'undefined' && window.open(getMailtoLink(email, value), '_self');
    setIsSecretSaved(true);
  };

  return (
    <>
      <InnerStepContainer>
        <Heading>Save your Recovery Secret</Heading>
        <ButtonContainer>
          <ActionButton icon="download" onClick={onDownload}>
            <CpslText variant="bodyXS" color="secondary" weight="medium">
              Download
            </CpslText>
          </ActionButton>
          <ActionButton icon={isCopied ? 'check' : 'copy'} onClick={onCopy}>
            <CpslText variant="bodyXS" color="secondary" weight="medium">
              {isCopied ? 'Copied!' : 'Copy'}
            </CpslText>
          </ActionButton>
          <ActionButton icon="send" onClick={onEmail}>
            <CpslText variant="bodyXS" color="secondary" weight="medium">
              Email
            </CpslText>
          </ActionButton>
        </ButtonContainer>
      </InnerStepContainer>
      <InnerStepContainer>
        <CpslButton fullWidth onClick={onComplete} disabled={!isSecretSaved}>
          {!isSecretSaved ? 'Choose an option above to continue' : 'I’ve saved my recovery secret'}
        </CpslButton>
      </InnerStepContainer>
    </>
  );
};

export const RecoverySecretStep = () => {
  const para = useInternalClient();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const setStep = useModalStore(state => state.setStep);
  const authInfo = para.authInfo;
  const recoveryShare = useModalStore(state => state.recoveryShare);

  const backupDecryptionKey = JSON.parse(recoveryShare || '{}').backupDecryptionKey;

  const onComplete = async () => {
    setStep(ModalStep.WALLET_CREATION_DONE);
  };

  return (
    <StepContainer>
      <InnerStepContainer>
        <Heading>{hideWallets ? "Don't lose access" : "Don't lose your wallet"}</Heading>
        <InlineText variant="bodyS" color="secondary" weight="medium">
          Your{' '}
          <InlineText variant="bodyS" weight="medium">
            Recovery Secret
          </InlineText>{' '}
          ensures you will be able to regain access to your {hideWallets ? 'account' : 'wallet'} if you lose your Passkey or
          Password.
        </InlineText>
      </InnerStepContainer>
      <SaveRecoverySecret
        email={authInfo?.authType === 'email' ? authInfo.identifier : undefined}
        value={backupDecryptionKey}
        onComplete={onComplete}
      />
    </StepContainer>
  );
};

const ActionButton = safeStyled(StyledCpslTileButton)`
  flex: 1;

  --button-icon-color: var(--cpsl-color-text-primary);
`;

const ButtonContainer = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const InlineText = safeStyled(CpslText)`
  text-align: center;
  display: inline-block;
`;
