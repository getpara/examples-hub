import { CpslButton, CpslDivider, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { InnerStepContainer, StepContainer, Heading, QRContainer } from '../common.js';
import { useCopyToClipboard, UserIdentifier } from '@getpara/react-common';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { AuthMethod } from '@getpara/web-sdk';
import { useStore } from '../../../provider/stores/useStore.js';

export const BiometricCreationStep = () => {
  const para = useInternalClient();
  const authInfo = para.authInfo;
  const appName = useStore(state => state.appName);
  const { presentSignupUi } = useAuthActions();
  const signupState = useModalStore(state => state.getSignupState());
  const authStepRoute = useModalStore(state => state.authStepRoute);
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    if (signupState?.passkeyUrl) {
      copy(signupState.passkeyUrl);
    }
  };

  const onClick = (method: AuthMethod) => () => {
    presentSignupUi(method, signupState!);
  };

  const isBoth = !!signupState?.passkeyUrl && !!signupState?.passwordUrl;

  if (!signupState) {
    return null;
  }

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading>
          {para.isExternalWalletAuth
            ? `Finish setup for your${appName ? ` ${appName}` : ''} wallet`
            : isBoth
              ? 'Secure Your Account'
              : 'Create Passkey'}
        </Heading>
        <UserIdentifier authInfo={authInfo} />
        <CpslText variant="bodyS" color="secondary" weight="medium">
          {isBoth ? 'Choose a password or set up a passkey' : 'Your Passkey keeps your account safe.'}
        </CpslText>
      </InnerStepContainer>

      <InnerStepContainer>
        {signupState?.isPasskeySupported ? (
          <CpslButton fullWidth onClick={onClick(AuthMethod.PASSKEY)}>
            <CpslIcon slot="start" icon="key" />
            {isBoth ? 'Create Passkey' : 'Create'}
          </CpslButton>
        ) : (
          <>
            <CpslText weight="semiBold">Scan with your mobile device</CpslText>
            <QRContainer>
              {!signupState?.passkeyUrl ? <CpslSpinner size={100} /> : <CpslQrCode url={signupState.passkeyUrl} />}
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

            <CpslButton fullWidth onClick={onClick(AuthMethod.PASSWORD)} disabled={!!authStepRoute}>
              <CpslIcon slot="start" icon="passcode" />
              Choose Password
            </CpslButton>
          </>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};
