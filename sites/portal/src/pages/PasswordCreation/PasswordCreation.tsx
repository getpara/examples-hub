import styled from 'styled-components';
import { Card, CardContent } from '../../components/common';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { CpslInputCustomEvent, InputInputEventDetail } from '@getpara/core-components';
import { passwordCreation } from '../../utils/passwordCreation';
import { REDIRECT_TIMEOUT } from '../../constants';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { usePara } from '../../components';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { AuthParams } from '@getpara/user-management-client';

export const PasswordCreation = () => {
  const para = usePara();
  const { partnerId, userId, passwordId, email, phone, countryCode, farcasterUsername, telegramUserId } = useExtractedParams<
    AuthParams & { userId: string; partnerId: string; passwordId: string }
  >();

  const [password, setPassword] = useState<string>();
  const [passwordVerification, setPasswordVerification] = useState<string>();
  const [passwordVisible, setPasswordVisible] = useState<boolean>();

  const [passwordCreated, setPasswordCreated] = useState<boolean>();

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

  const handlePasswordClick = async () => {
    await passwordCreation(para, {
      partnerId,
      userId,
      auth: {
        email,
        phone,
        countryCode,
        farcasterUsername,
        telegramUserId,
      },
      password,
      passwordId,
    });

    setPasswordCreated(true);

    setTimeout(function () {
      window.close();
    }, REDIRECT_TIMEOUT);
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
                <CpslText variant="headingS" weight="regular">
                  Create Password
                </CpslText>
                <CpslText variant="bodyM" weight="regular" color="secondary" style={{ textAlign: 'center' }}>
                  Write down your password somewhere safe. It cannot be recovered.
                </CpslText>
              </InnerContainer>
              <InnerContainer>
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
                <CpslButton fullWidth onClick={handlePasswordClick} disabled={!passwordValid}>
                  Save Password
                </CpslButton>
              </InnerContainer>
            </>
          )}
        </Container>
      </CardContent>
    </Card>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 34px;
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ClickableIcon = styled(CpslIcon)`
  cursor: pointer;
`;
