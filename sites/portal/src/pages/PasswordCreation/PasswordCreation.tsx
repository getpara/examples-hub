import styled from 'styled-components';
import { Card, CardContent } from '../../components/common';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { CpslInputCustomEvent, InputInputEventDetail } from '@getpara/core-components';
import { passwordCreation } from '../../utils/passwordCreation';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { usePara } from '../../components';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { useSearchParams } from 'react-router-dom';
import { isIFramed } from '../../utils/isIFramed';

export const PasswordCreation = () => {
  const para = usePara();
  const { partnerId, userId, passwordId } = useExtractedParams<{ userId: string; partnerId: string; passwordId: string }>();
  const closeWindow = useCloseWindow();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState<string>();
  const [passwordVerification, setPasswordVerification] = useState<string>();
  const [passwordVisible, setPasswordVisible] = useState<boolean>();

  const [passwordCreated, setPasswordCreated] = useState<boolean>();
  const [isProcessing, setIsProcessing] = useState<boolean>();

  const handlePasswordInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPassword(ev.detail.value);
  };

  const handlePasswordVerificationInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPasswordVerification(ev.detail.value);
  };

  const passwordMatches = password === passwordVerification;
  const passwordLength = password?.length >= 8;
  const passwordHasNoSpaces = !/\s/.test(password);

  const passwordValid = passwordMatches && passwordLength && passwordHasNoSpaces;

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []);

  function passwordHelperText() {
    if (!passwordLength && !passwordHasNoSpaces) {
      return 'Password must be at least 8 characters long and contain no spaces.';
    }

    if (!passwordLength) {
      return 'Password must be at least 8 characters long.';
    }

    if (!passwordHasNoSpaces) {
      return 'Password must contain no spaces.';
    }

    return null;
  }

  const onSubmit = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await passwordCreation(para, {
        partnerId,
        userId,
        password,
        passwordId,
        isForNewDevice: searchParams.get('isForNewDevice') === 'true',
      });

      setPasswordCreated(true);

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
      console.error(e);
      setIsProcessing(false);
    }
  };

  const { partner } = useModalOutletContext();

  return (
    <Card>
      <CardContent>
        <Container slot="body">
          {passwordCreated ? (
            <ModalSuccess
              heading="Password Created!"
              subHeading={`You can now close this window and return to ${partner.displayName}.`}
            />
          ) : (
            <>
              <InnerContainer>
                <CpslText variant="bodyL" weight="semiBold">
                  Create Password
                </CpslText>
                <CpslText variant="bodyS" color="secondary" weight="medium" style={{ textAlign: 'center' }}>
                  Write down your password somewhere safe. It cannot be recovered.
                </CpslText>
              </InnerContainer>
              <InnerContainerForm
                onSubmit={e => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <CpslInput
                  placeholder="Enter password"
                  type={passwordVisible ? 'text' : 'password'}
                  onCpslInput={handlePasswordInput}
                  value={password}
                  style={{ width: '100%' }}
                >
                  <ClickableIcon
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    slot="end"
                    icon={passwordVisible ? 'eye' : 'eyeOff'}
                  />
                </CpslInput>
                {passwordHelperText() && (
                  <CpslText variant="bodyXS" color="secondary" style={{ width: '100%' }}>
                    {passwordHelperText()}
                  </CpslText>
                )}
                <CpslInput
                  placeholder="Confirm password"
                  type={passwordVisible ? 'text' : 'password'}
                  onCpslInput={handlePasswordVerificationInput}
                  onKeyDown={async e => e.key === 'Enter' && onSubmit()}
                  value={passwordVerification}
                  style={{ width: '100%' }}
                >
                  <ClickableIcon
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    slot="end"
                    icon={passwordVisible ? 'eye' : 'eyeOff'}
                  />
                </CpslInput>
                {!passwordMatches && (
                  <CpslText variant="bodyXS" color="error" style={{ width: '100%' }}>
                    Passwords do not match.
                  </CpslText>
                )}
                <CpslButton fullWidth disabled={!passwordValid || isProcessing} onClick={onSubmit}>
                  Save Password
                </CpslButton>
              </InnerContainerForm>
            </>
          )}
        </Container>
      </CardContent>
    </Card>
  );
};

const Container = styled.div`
  padding-left: ${isIFramed ? '0px' : '83px'};
  padding-right: ${isIFramed ? '0px' : '83px'};
  padding-top: ${isIFramed ? '0px' : '24px'};
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 32px;
`;

const innerContainer = `
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const InnerContainer = styled.div`
  ${innerContainer}
`;

const InnerContainerForm = styled.form`
  ${innerContainer}
`;

const ClickableIcon = styled(CpslIcon)`
  cursor: pointer;
`;
