import { styled } from 'styled-components';
import { Text, Link } from '../../../components/common';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@usecapsule/react-components';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCapsule } from '../../../components/CapsuleContext';
import { CpslInputCustomEvent, InputInputEventDetail } from '@usecapsule/core-components';

interface EnterPasswordStepProps {
  error: string | undefined;
  onLoginClick: (password: string) => void;
}

export const EnterPasswordStep = ({ error, onLoginClick }: EnterPasswordStepProps) => {
  const capsule = useCapsule();
  const [searchParams] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const [recoveryUrl, setRecoveryUrl] = useState<string | undefined>();
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handlePasswordInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPassword(ev.detail.value);
  };

  const getPortalUrl = async () => {
    setRecoveryUrl(await capsule?.getPortalURL());
  };

  useEffect(() => {
    getPortalUrl();
  }, [capsule]);

  return (
    <Container>
      <CpslText variant="headingS">Login</CpslText>
      <EmailContainer>
        <EmailIcon icon="wallet" />
        <Text>
          <span>{paramsEmail}</span>
        </Text>
      </EmailContainer>
      <ButtonContainer>
        <CpslInput
          placeholder="Enter a password"
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
        {error && (
          <ErrorContainer>
            <ErrorIcon icon="alertCircle" />
            <CpslText variant="bodyXS" color="error" style={{ width: '100%' }}>
              {error}
            </CpslText>
          </ErrorContainer>
        )}
        <CpslButton fullWidth onClick={() => onLoginClick(password)}>
          Continue
        </CpslButton>
        <Link href={recoveryUrl}>
          <LinkText>I’m having trouble logging into my wallet</LinkText>
        </Link>
      </ButtonContainer>
    </Container>
  );
};

const LinkText = styled(Text)`
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 4px;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const EmailContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  padding: 2px 16px;
  border-radius: 1000px;
  border: 1px solid var(--cpsl-color-input-border-placeholder);
`;

const EmailIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-secondary);
`;

const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;

const ClickableIcon = styled(CpslIcon)`
  cursor: pointer;
`;

const Container = styled.div`
  flex: 1;
  padding-left: 83px;
  padding-right: 83px;
  padding-top: 24px;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;
`;
