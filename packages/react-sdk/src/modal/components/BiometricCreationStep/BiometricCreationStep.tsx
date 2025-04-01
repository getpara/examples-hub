import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { InnerStepContainer, StepContainer, Heading, QRContainer } from '../common.js';
import { useCopyToClipboard, UserIdentifier } from '@getpara/react-common';
import { useContext } from 'react';
import { ActionsContext } from '../ModalContent/ModalContent.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';

export const BiometricCreationStep = () => {
  const para = useInternalClient();
  const appName = useStore(state => state.appName);
  const { createAccount } = useContext(ActionsContext);
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const isPasskeySupported = useModalStore(state => state.isPasskeySupported);
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    if (webAuthURLForCreate) {
      copy(webAuthURLForCreate);
    }
  };

  const isBoth = !!webAuthURLForCreate && !!iFrameUrl;

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          {para.isExternalWalletAuth
            ? `Finish setup for your${appName ? ` ${appName}` : ''} wallet`
            : isBoth
              ? 'Secure Your Account'
              : 'Create Passkey'}
        </Heading>
        {authInfo && <UserIdentifier {...authInfo} />}
        <CpslText variant="bodyS" color="secondary" weight="medium">
          {isBoth ? 'Choose a password or set up a passkey' : 'Your Passkey keeps your account safe.'}
        </CpslText>
      </InnerStepContainer>

      <InnerStepContainer>
        {isPasskeySupported ? (
          <CpslButton fullWidth onClick={createAccount.withPasskey}>
            <CpslIcon slot="start" icon="key" />
            {isBoth ? 'Create Passkey' : 'Create'}
          </CpslButton>
        ) : (
          <>
            <CpslText weight="semiBold">Scan with your mobile device</CpslText>
            <QRContainer>
              {!webAuthURLForCreate ? <CpslSpinner size={100} /> : <CpslQrCode url={webAuthURLForCreate} />}
            </QRContainer>
            <CpslButton size="small" variant="ghost" onClick={handleCopy}>
              <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
              {isCopied ? 'Copied' : 'Copy Link'}
            </CpslButton>
          </>
        )}

        {isBoth && (
          <>
            <CpslDivider>or</CpslDivider>

            <CpslButton fullWidth onClick={createAccount.withPassword}>
              <CpslIcon slot="start" icon="passcode" />
              Choose Password
            </CpslButton>
          </>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};
