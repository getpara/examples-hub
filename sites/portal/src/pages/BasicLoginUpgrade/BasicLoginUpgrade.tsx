import styled from 'styled-components';
import { Card, CardContent } from '../../components/common';
import { useEffect, useState } from 'react';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { ModalLoading, usePara } from '../../components';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { basicLoginUpgrade } from '../../utils/basicLoginUpgrade';
import { CpslButton, CpslCheckbox, CpslText } from '@getpara/react-components';
import { useSearchParams } from 'react-router-dom';
import { AuthMethod } from '@getpara/user-management-client';
import { HeaderIcon } from '../../components/HeaderIcon';

type BasicLoginUpgradeProps = {
  onUpgradeClick?: () => Promise<void>;
  onSkipClick?: (_?: boolean) => Promise<void>;
  onLogin?: () => Promise<void>;
};

export const BasicLoginUpgrade = ({ onUpgradeClick, onSkipClick, onLogin }: BasicLoginUpgradeProps) => {
  const para = usePara();
  const closeWindow = useCloseWindow();
  const [searchParams] = useSearchParams();

  const [isDone, setIsDone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loginMethodLabel, setLoginMethodLabel] = useState<string | null>('email');
  const [supportedAuthMethodLabel, setSupportedAuthMethodLabel] = useState<string | null>('Passkey');
  const [shouldSkipPrompt, setShouldSkipPrompt] = useState<boolean>(false);

  const sessionId = searchParams.get('sessionId');
  const isFromLoginFlow = !!onSkipClick;

  const setup = async () => {
    setIsSetup(false);
    const supportedAuthMethods = await para.supportedUserAuthMethods();

    const hasPasskey = supportedAuthMethods.has(AuthMethod.PASSKEY);
    const hasPIN = supportedAuthMethods.has(AuthMethod.PIN);
    const hasPassword = supportedAuthMethods.has(AuthMethod.PASSWORD);

    const supportedMethods = [];
    if (hasPasskey) supportedMethods.push('Passkey');
    if (hasPIN) supportedMethods.push('PIN');
    if (hasPassword) supportedMethods.push('Password');

    const _supportedAuthMethodLabel =
      supportedMethods.length > 1
        ? supportedMethods.slice(0, -1).join(', ') + ' or ' + supportedMethods.slice(-1)
        : supportedMethods[0];

    setSupportedAuthMethodLabel(_supportedAuthMethodLabel);

    const { loginMethod } = await para.ctx.client.sessionLoginMethod(sessionId);

    // Due to how we handle sessions on login, we may not have a loginMethod set in some cases, handle that here
    if (!loginMethod) {
      switch (para.authInfo.authType) {
        case 'email': {
          setLoginMethodLabel('email');
          break;
        }
        case 'phone': {
          setLoginMethodLabel('phone number');
          break;
        }
        case 'telegram':
          setLoginMethodLabel('Telegram account');
          break;
        case 'farcaster':
          setLoginMethodLabel('Farcaster account');
          break;
      }
      return;
    }

    switch (loginMethod) {
      case 'EMAIL':
        setLoginMethodLabel('email');
        break;
      case 'PHONE':
        setLoginMethodLabel('phone number');
        break;
      case 'TELEGRAM':
        setLoginMethodLabel('Telegram account');
        break;
      case 'FARCASTER':
        setLoginMethodLabel('Farcaster account');
        break;
      case 'EXTERNAL_WALLET':
        setLoginMethodLabel('external wallet');
        break;
      case 'GOOGLE':
        setLoginMethodLabel('Google account');
        break;
      case 'TWITTER':
        setLoginMethodLabel('X account');
        break;
      case 'APPLE':
        setLoginMethodLabel('Apple account');
        break;
      case 'DISCORD':
        setLoginMethodLabel('Discord account');
        break;
      case 'FACEBOOK':
        setLoginMethodLabel('Facebook account');
        break;
      default:
        setLoginMethodLabel(`${loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1).toLowerCase()} account`);
        break;
    }

    setIsSetup(true);
  };

  const handleUpgrade = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      onUpgradeClick && (await onUpgradeClick());
      await basicLoginUpgrade(para);

      setIsDone(true);

      // Check for native callback URL
      const urlParams = new URLSearchParams(window.location.search);
      const nativeCallbackUrl = urlParams.get('nativeCallbackUrl');

      if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
        // Redirect to the native callback URL if it exists and is valid
        window.location.href = nativeCallbackUrl;
      } else {
        // Otherwise, close the window after a delay
        closeWindow(true);
      }
    } catch (e) {
      setError('An unexpected error occurred during the upgrade process.');
      console.error(e);
    } finally {
      await onLogin?.();
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setup();
  }, []);

  const { partner } = useModalOutletContext();

  const handleSkipClick = () => {
    onSkipClick ? onSkipClick(shouldSkipPrompt) : closeWindow();
  };

  return (
    <StyledCard>
      <CardContent>
        <Container slot="body">
          {!isSetup ? (
            <ModalLoading noText />
          ) : isDone ? (
            <ModalSuccess
              heading="Success!"
              subHeading={`You can now close this window and return to ${partner.displayName}.`}
            />
          ) : (
            <>
              <Header>
                <HeaderIcon icon="zap" />
                <CpslText variant="bodyL" weight="semiBold">
                  Quick Login
                </CpslText>
                {!!error ? (
                  <CpslText variant="bodyS" color="error" weight="medium" style={{ textAlign: 'center' }}>
                    {error}
                  </CpslText>
                ) : (
                  <CpslText variant="bodyS" color="secondary" weight="medium" style={{ textAlign: 'center' }}>
                    {`You can now login with your ${loginMethodLabel} only. This means you no longer need a ${supportedAuthMethodLabel}.`}
                  </CpslText>
                )}
              </Header>
              {!!error ? null : isProcessing ? (
                <ModalLoading noText />
              ) : (
                <>
                  <InnerContainer>
                    <CpslButton fullWidth onClick={handleUpgrade}>
                      Turn on Quick Login
                    </CpslButton>
                    <CpslButton fullWidth variant="secondary" onClick={handleSkipClick}>
                      {`Keep Using ${supportedAuthMethodLabel}`}
                    </CpslButton>
                  </InnerContainer>
                  {isFromLoginFlow && (
                    <CheckContainer>
                      <CpslCheckbox
                        checked={shouldSkipPrompt || false}
                        onCpslCheckboxChanged={(e: any) => {
                          setShouldSkipPrompt(e.detail ?? false);
                        }}
                      />
                      <CpslText variant="body">Don’t ask to upgrade again</CpslText>
                    </CheckContainer>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </CardContent>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  &::part(card-container) {
    padding: 16px;
  }
`;

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

const InnerContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

const CheckContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
