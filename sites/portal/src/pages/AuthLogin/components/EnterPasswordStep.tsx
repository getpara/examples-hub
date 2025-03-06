import { styled } from 'styled-components';
import { Text, Link } from '../../../components/common';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { usePara } from '../../../components/ParaContext';
import { CpslInputCustomEvent, InputInputEventDetail } from '@getpara/core-components';
import { UserIdentifier } from '@getpara/react-common';
import { useAuthInfo } from '../../../hooks/useAuthInfo';

interface EnterPasswordStepProps {
  error: string | undefined;
  onLoginClick: (password: string) => void;
}

export const EnterPasswordStep = ({ error, onLoginClick }: EnterPasswordStepProps) => {
  const para = usePara();
  const [recoveryUrl, setRecoveryUrl] = useState<string | undefined>();
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const authInfo = useAuthInfo();

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePasswordInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPassword(ev.detail.value);
  };

  const getPortalUrl = async () => {
    setRecoveryUrl(await para?.getPortalURL());
  };

  const onSubmit = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      await onLoginClick(password);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    getPortalUrl();
  }, [para]);

  useEffect(() => {
    if (!!error) {
      setPassword('');
    }
  }, [error]);

  return (
    <Container
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <CpslText variant="headingS">Login</CpslText>
      {!!authInfo && authInfo.authType !== 'userId' && <UserIdentifier {...authInfo} />}
      <ButtonContainer>
        <CpslInput
          placeholder="Enter a password"
          type={passwordVisible ? 'text' : 'password'}
          onCpslInput={handlePasswordInput}
          onKeyDown={async e => e.key === 'Enter' && onSubmit()}
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
        <CpslButton fullWidth disabled={isProcessing || password === ''} onClick={onSubmit}>
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

const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;

const ClickableIcon = styled(CpslIcon)`
  cursor: pointer;
`;

const Container = styled.form`
  flex: 1;
  padding-left: 83px;
  padding-right: 83px;
  padding-top: 24px;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;
`;
