import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { InnerStepContainer, StepContainer, Heading, QRContainer } from '../common.js';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { useCopyToClipboard, UserIdentifier } from '@getpara/react-common';

export const BiometricCreationStep = ({
  handlePasswordClick,
  handlePasskeyClick,
}: {
  handlePasswordClick: () => Promise<void>;
  handlePasskeyClick: () => Promise<void>;
}) => {
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(webAuthURLForCreate);
  };

  const isBoth = !!webAuthURLForCreate && !!iFrameUrl;

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
